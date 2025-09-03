const pool = require("../../dbConfig/db");

class SubTask {
  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM subTask ORDER BY createdAt DESC");
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM subTask WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByProjectId(projectId) {
    const [rows] = await pool.query(
      "SELECT * FROM subTask WHERE ProjectId = ? ORDER BY projectstageIndex, subtaskIndex, createdAt",
      [projectId]
    );
    return rows;
  }

  static async getNextSubtaskIndex(projectId, projectstageIndex) {
    const [rows] = await pool.query(
      "SELECT MAX(subtaskIndex) as maxIndex FROM subTask WHERE ProjectId = ? AND projectstageIndex = ?",
      [projectId, projectstageIndex]
    );
    return (rows[0].maxIndex || 0) + 1;
  }

  static async create(subTaskData) {
    const { ProjectId, projectstageIndex, Task, createdBy, IsCompleted } = subTaskData;
    
    // Get the next subtask index for this project and stage
    const subtaskIndex = await SubTask.getNextSubtaskIndex(ProjectId, projectstageIndex);
    
    const [result] = await pool.query(
      "INSERT INTO subTask (ProjectId, projectstageIndex, Task, subtaskIndex, createdBy, IsCompleted) VALUES (?, ?, ?, ?, ?, ?)",
      [ProjectId, projectstageIndex, Task, subtaskIndex, createdBy, IsCompleted || false]
    );
    return { id: result.insertId, ...subTaskData, subtaskIndex };
  }

  static async update(id, subTaskData) {
    const { ProjectId, projectstageIndex, Task, createdBy, IsCompleted } = subTaskData;
    await pool.query(
      "UPDATE subTask SET ProjectId = ?, projectstageIndex = ?, Task = ?, createdBy = ?, IsCompleted = ? WHERE id = ?",
      [ProjectId, projectstageIndex, Task, createdBy, IsCompleted, id]
    );
    return { id, ...subTaskData };
  }

  static async delete(id) {
    await pool.query("DELETE FROM subTask WHERE id = ?", [id]);
    return true;
  }

  static async toggleComplete(id) {
    const [result] = await pool.query(
      "UPDATE subTask SET IsCompleted = NOT IsCompleted WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async updateSubtaskIndex(id, subtaskIndex) {
    await pool.query(
      "UPDATE subTask SET subtaskIndex = ? WHERE id = ?",
      [subtaskIndex, id]
    );
    return true;
  }

  static async swapSubtaskIndexes(id1, id2) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current indexes
      const [task1] = await connection.query("SELECT subtaskIndex FROM subTask WHERE id = ?", [id1]);
      const [task2] = await connection.query("SELECT subtaskIndex FROM subTask WHERE id = ?", [id2]);

      if (task1.length === 0 || task2.length === 0) {
        throw new Error('One or both tasks not found');
      }

      // Swap the indexes
      await connection.query(
        "UPDATE subTask SET subtaskIndex = ? WHERE id = ?",
        [task2[0].subtaskIndex, id1]
      );
      await connection.query(
        "UPDATE subTask SET subtaskIndex = ? WHERE id = ?",
        [task1[0].subtaskIndex, id2]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async reorderSubtasks(projectId, stageIndex, newOrder) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of newOrder) {
        await connection.query(
          "UPDATE subTask SET subtaskIndex = ? WHERE id = ? AND ProjectId = ? AND projectstageIndex = ?",
          [item.newIndex, item.id, projectId, stageIndex]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async moveSubtaskUp(id, projectId, stageIndex) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current task and its index
      const [currentTask] = await connection.query(
        "SELECT id, subtaskIndex FROM subTask WHERE id = ?", 
        [id]
      );

      if (currentTask.length === 0) {
        throw new Error('Task not found');
      }

      const currentIndex = currentTask[0].subtaskIndex;

      // Get the task above
      const [taskAbove] = await connection.query(
        "SELECT id, subtaskIndex FROM subTask WHERE ProjectId = ? AND projectstageIndex = ? AND subtaskIndex < ? ORDER BY subtaskIndex DESC LIMIT 1",
        [projectId, stageIndex, currentIndex]
      );

      if (taskAbove.length === 0) {
        // Already at the top
        await connection.commit();
        return false;
      }

      // Swap indexes
      await connection.query(
        "UPDATE subTask SET subtaskIndex = ? WHERE id = ?",
        [taskAbove[0].subtaskIndex, id]
      );
      await connection.query(
        "UPDATE subTask SET subtaskIndex = ? WHERE id = ?",
        [currentIndex, taskAbove[0].id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async moveSubtaskDown(id, projectId, stageIndex) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current task and its index
      const [currentTask] = await connection.query(
        "SELECT id, subtaskIndex FROM subTask WHERE id = ?", 
        [id]
      );

      if (currentTask.length === 0) {
        throw new Error('Task not found');
      }

      const currentIndex = currentTask[0].subtaskIndex;

      // Get the task below
      const [taskBelow] = await connection.query(
        "SELECT id, subtaskIndex FROM subTask WHERE ProjectId = ? AND projectstageIndex = ? AND subtaskIndex > ? ORDER BY subtaskIndex ASC LIMIT 1",
        [projectId, stageIndex, currentIndex]
      );

      if (taskBelow.length === 0) {
        // Already at the bottom
        await connection.commit();
        return false;
      }

      // Swap indexes
      await connection.query(
        "UPDATE subTask SET subtaskIndex = ? WHERE id = ?",
        [taskBelow[0].subtaskIndex, id]
      );
      await connection.query(
        "UPDATE subTask SET subtaskIndex = ? WHERE id = ?",
        [currentIndex, taskBelow[0].id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = SubTask;
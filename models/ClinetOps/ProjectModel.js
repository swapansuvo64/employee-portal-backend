const pool = require("../../dbConfig/db");

class ProjectModel {
  // Get all projects with their milestones and tasks for cards (only with machineUsed)
  static async getAllProjectsForCards() {
    try {
      const query = `
        SELECT 
          p.id,
          p.name as projectName,
          p.status as projectStatus,
          p.priority,
          p.assigned_team,
          p.clients,
          p.start_date,
          p.expected_end_date,
          p.target_end_date,
          p.end_date,
          p.milestones,
          p.milestones_status,
          p.job_no,
          p.created_by,
          p.created_at,
          p.updated_at,
          t.id as taskId,
          t.ProjectId,
          t.projectstageIndex,
          t.Task as stageName,
          t.subtaskIndex,
          t.machineUsed,
          t.deadline,
          t.notes,
          t.IsCompleted,
          t.createdBy as taskCreatedBy,
          t.createdAt as taskCreatedAt,
          t.updatedAt as taskUpdatedAt
        FROM projects p
        LEFT JOIN subTask t ON p.id = t.ProjectId
        WHERE t.machineUsed IS NOT NULL AND t.machineUsed != ''
        ORDER BY p.id, t.projectstageIndex, t.subtaskIndex
      `;
      
      const [results] = await pool.execute(query);
      return this.formatProjectsForCards(results);
    } catch (error) {
      throw error;
    }
  }

  // Format projects data for card display
  static formatProjectsForCards(data) {
    const projectsMap = new Map();
    
    data.forEach(row => {
      if (!projectsMap.has(row.id)) {
        projectsMap.set(row.id, {
          projectId: row.id,
          projectName: row.projectName,
          projectStatus: row.projectStatus,
          priority: row.priority,
          assignedTeam: row.assigned_team,
          clients: row.clients,
          startDate: row.start_date,
          expectedEndDate: row.expected_end_date,
          targetEndDate: row.target_end_date,
          endDate: row.end_date,
          jobNo: row.job_no,
          createdBy: row.created_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          milestones: this.parseMilestones(row.milestones, row.milestones_status),
          cards: []
        });
      }
      
      const project = projectsMap.get(row.id);
      
      // Only add cards with machineUsed (already filtered in query, but double-check)
      if (row.taskId && row.machineUsed) {
        // Map milestone using projectstageIndex
        const milestone = project.milestones.find(m => m.index === row.projectstageIndex);
        
        if (milestone) {
          const card = {
            cardId: `${row.id}-${row.projectstageIndex}-${row.subtaskIndex}`,
            projectId: row.id,
            ProjectName: row.projectName,
            projectStatus: row.projectStatus,
            priority: row.priority,
            milestoneName: milestone.name,
            milestoneIndex: row.projectstageIndex,
            stageName: row.stageName,
            subtaskIndex: row.subtaskIndex,
            machineUsed: row.machineUsed,
            deadline: row.deadline,
            notes: row.notes,
            isCompleted: Boolean(row.IsCompleted),
            taskCreatedBy: row.taskCreatedBy,
            taskCreatedAt: row.taskCreatedAt,
            taskUpdatedAt: row.taskUpdatedAt,
            status: this.calculateCardStatus(project, milestone, row)
          };
          
          project.cards.push(card);
        }
      }
    });
    
    // Filter out projects that have no cards after processing
    const projectsWithCards = Array.from(projectsMap.values()).filter(project => 
      project.cards.length > 0
    );
    
    return projectsWithCards;
  }

  // Parse milestones string into array of objects with proper index mapping
  static parseMilestones(milestonesStr, milestonesStatusStr) {
    if (!milestonesStr) return [];
    
    const milestoneNames = milestonesStr.split(',');
    const statuses = milestonesStatusStr ? milestonesStatusStr.split(',') : [];
    
    return milestoneNames.map((name, index) => ({
      index: index, // This index corresponds to projectstageIndex in tasks table
      name: name.trim(),
      status: statuses[index] ? statuses[index].trim() : 'pending'
    }));
  }

  // Calculate card status
  static calculateCardStatus(project, milestone, task) {
    if (task.IsCompleted) return 'completed';
    if (milestone.status === 'in progress') return 'in progress';
    if (project.projectStatus === 'In Progress') return 'in progress';
    return 'pending';
  }

  // Get project by ID with full details (only tasks with machineUsed)
  static async getProjectById(projectId) {
    try {
      const projectQuery = `
        SELECT * FROM projects WHERE id = ?
      `;
      
      const tasksQuery = `
        SELECT * FROM subTask 
        WHERE ProjectId = ? AND machineUsed IS NOT NULL AND machineUsed != ''
        ORDER BY projectstageIndex, subtaskIndex
      `;
      
      const [projectResults] = await pool.execute(projectQuery, [projectId]);
      const [taskResults] = await pool.execute(tasksQuery, [projectId]);
      
      if (projectResults.length === 0) {
        return null;
      }
      
      const project = projectResults[0];
      return this.formatFullProject(project, taskResults);
    } catch (error) {
      throw error;
    }
  }

  // Format full project with milestones and tasks (only with machineUsed)
  static formatFullProject(project, tasks) {
    const milestones = this.parseMilestones(project.milestones, project.milestones_status);
    
    // Group tasks by milestone index
    const milestonesWithTasks = milestones.map(milestone => {
      const milestoneTasks = tasks.filter(task => task.projectstageIndex === milestone.index);
      
      return {
        ...milestone,
        tasks: milestoneTasks.map(task => ({
          id: task.id,
          task: task.Task,
          subtaskIndex: task.subtaskIndex,
          machineUsed: task.machineUsed,
          deadline: task.deadline,
          notes: task.notes,
          isCompleted: Boolean(task.IsCompleted),
          createdBy: task.createdBy,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }))
      };
    });

    return {
      projectId: project.id,
      projectName: project.name,
      projectStatus: project.status,
      priority: project.priority,
      assignedTeam: project.assigned_team,
      clients: project.clients,
      startDate: project.start_date,
      expectedEndDate: project.expected_end_date,
      targetEndDate: project.target_end_date,
      endDate: project.end_date,
      jobNo: project.job_no,
      createdBy: project.created_by,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      urls: project.urls,
      goals: project.goals,
      description: project.description,
      isPrintProject: Boolean(project.isPrintProject),
      estimatedTime: project.estimatedTime,
      milestones: milestonesWithTasks,
      overallProgress: this.calculateOverallProgress(milestonesWithTasks)
    };
  }

  // Calculate overall progress percentage (only for tasks with machineUsed)
  static calculateOverallProgress(milestones) {
    if (!milestones.length) return 0;
    
    const totalTasks = milestones.reduce((sum, milestone) => sum + milestone.tasks.length, 0);
    if (totalTasks === 0) return 0;
    
    const completedTasks = milestones.reduce((sum, milestone) => 
      sum + milestone.tasks.filter(task => task.isCompleted).length, 0
    );
    
    return Math.round((completedTasks / totalTasks) * 100);
  }

  // Additional method: Get all machines used across projects
  static async getAllMachinesUsed() {
    try {
      const query = `
        SELECT DISTINCT machineUsed 
        FROM subTask 
        WHERE machineUsed IS NOT NULL AND machineUsed != ''
        ORDER BY machineUsed
      `;
      
      const [results] = await pool.execute(query);
      return results.map(row => row.machineUsed);
    } catch (error) {
      throw error;
    }
  }

  // Additional method: Get projects by machine
  static async getProjectsByMachine(machineName) {
    try {
      const query = `
        SELECT 
          p.id,
          p.name as projectName,
          p.status as projectStatus,
          p.priority,
          p.assigned_team,
          p.clients,
          p.milestones,
          p.milestones_status,
          t.projectstageIndex,
          t.Task as stageName,
          t.subtaskIndex,
          t.machineUsed,
          t.deadline,
          t.notes,
          t.IsCompleted
        FROM projects p
        INNER JOIN subTask t ON p.id = t.ProjectId
        WHERE t.machineUsed = ?
        ORDER BY p.id, t.projectstageIndex, t.subtaskIndex
      `;
      
      const [results] = await pool.execute(query, [machineName]);
      return this.formatProjectsForCards(results);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProjectModel;
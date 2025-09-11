const pool = require("../../dbConfig/db");
class ExpectedDateLog {
    static async getByProjectId(projectId){
        const [rows]= await pool.query(
            "SELECT * FROM expectedDate WHERE projectId = ? ORDER BY created_at DESC",
      [projectId]
    );
    return rows;
  }
  static async update(projectId,expectedDate,createdBy){
    const [result] =await pool.query(
        "UPDATE expectedDate SET expectedDate=?, createdBy=? WHERE projectId = ? ",
        [expectedDate,createdBy,projectId]
    )
    return result.affectedRows;
  }
  static async create({expectedDate,projectId,createdBy}){
    const [result] = await pool.query(
        "INSERT INTO expectedDate (expectedDate,projectId,createdBy) VALUES (?,?,?)",
        [expectedDate,projectId,createdBy] );
   return { id: result.insertId };
  }


}
module.exports=ExpectedDateLog;
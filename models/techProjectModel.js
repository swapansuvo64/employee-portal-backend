const db = require('../dbConfig/db');

const techProject = {
    getAll: async() =>{
        const [rows]= await db.query('SELECT * FROM techProject');
        return rows;
    },
    getById: async(id) =>{
        const [rows] =await db.query('SELECT * FROM techProject WHERE ID = ?',[id] );
        return rows[0];
    },
    create : async (team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status)=>{
        const [result] =await db.query(
            'INSERT INTO techProject (team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status) VALUES (?,?,?,?,?,?,?,?,?)',
            [team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status]
        );
        return {id: result.insertId, team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status};
    },
    update: async(id,team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status)=>{
        const [result] = await db.query(
            'UPDATE techProject SET team_id = ?, project_name = ?, github_links = ?, description = ?, techstacks = ?, media = ?, start_date = ?, end_date = ?, status = ? WHERE ID = ?',
            [team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status,id]
        );
        return result.affectedRows > 0;
    },
    delete: async(id)=>{
        const [result] =await db.query('DELETE FROM techProject WHERE ID = ?',[id]);
        return result.affectedRows > 0;
    }
}
module.exports = techProject;
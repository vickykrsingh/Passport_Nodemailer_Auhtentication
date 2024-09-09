const poolDB = require("../config/db");
const getCattle = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    gender__c,
    sick__c,
    adoption_status__c,
    old__c,
  } = req.query;
  const offset = (page - 1) * limit;

  // Create WHERE clauses for filters
  let filterClauses = [];
  let values = [limit, offset];
  let index = 3;

  if (gender__c) {
    filterClauses.push(`gender__c = $${index}`);
    values.push(gender__c);
    index++;
  }
  if (sick__c !== undefined && sick__c) {
    filterClauses.push(`sick__c = $${index}`);
    values.push(sick__c === "true");
    index++;
  }
  if (adoption_status__c) {
    filterClauses.push(`adoption_status__c = $${index}`);
    values.push(adoption_status__c);
    index++;
  }
  if (old__c !== undefined && old__c) {
    filterClauses.push(`old__c = $${index}`);
    values.push(old__c === "true");
    index++;
  }

  const whereClause = filterClauses.length
    ? `WHERE ${filterClauses.join(" AND ")}`
    : "";

  try {
    const result = await poolDB.query(
      `SELECT * FROM bayavasfdc.cattle__c ${whereClause} ORDER BY id LIMIT $1 OFFSET $2`,
      values
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};


const getCattleById = async (req,res) => {
  const id = await req.params.id;
  try {
    const result = await poolDB.query(`SELECT * FROM bayavasfdc.cattle__c WHERE id=${id}`);
    if(result){
      res.json(result)
    }else{
      res.status(400).json("data not found")
    }
  } catch (error) {
    res.status(500).json('Server error')
    console.log(error.message)
  }
}


module.exports = {getCattle,getCattleById}
const { connectWithTunnel } = require("../config/postgres");
const fs = require("fs");

async function insertJobPosting(pgClient, jobData) {
    const insertQuery = `
    INSERT INTO jobs (
      id, date_posted, date_created, title, organization, organization_url,
      date_validthrough, location_type, employment_type, url, source_type,
      source, organization_logo, remote_derived, domain_derived, description_text,
      ai_salary_currency, ai_salary_value, ai_salary_minvalue, ai_salary_maxvalue,
      ai_salary_unittext, ai_benefits, ai_experience_level, ai_work_arrangement,
      ai_work_arrangement_office_days, ai_remote_location, ai_remote_location_derived,
      ai_key_skills, ai_core_responsibilities, ai_requirements_summary,
      ai_working_hours, ai_employment_type, ai_job_language, ai_visa_sponsorship,
      ai_keywords, ai_taxonomies_a, ai_education_requirements
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, $34, $35, $36, $37
    )`;

    const values = [
        jobData.id,
        jobData.date_posted,
        jobData.date_created,
        jobData.title,
        jobData.organization,
        jobData.organization_url,
        jobData.date_validthrough,
        jobData.location_type,
        jobData.employment_type,
        jobData.url,
        jobData.source_type,
        jobData.source,
        jobData.organization_logo,
        jobData.remote_derived,
        jobData.domain_derived,
        jobData.description_text,
        jobData.ai_salary_currency,
        jobData.ai_salary_value,
        jobData.ai_salary_minvalue,
        jobData.ai_salary_maxvalue,
        jobData.ai_salary_unittext,
        jobData.ai_benefits,
        jobData.ai_experience_level,
        jobData.ai_work_arrangement,
        jobData.ai_work_arrangement_office_days,
        jobData.ai_remote_location,
        jobData.ai_remote_location_derived,
        JSON.stringify(jobData.ai_key_skills),
        jobData.ai_core_responsibilities,
        jobData.ai_requirements_summary,
        jobData.ai_working_hours,
        JSON.stringify(jobData.ai_employment_type),
        jobData.ai_job_language,
        jobData.ai_visa_sponsorship,
        JSON.stringify(jobData.ai_keywords),
        JSON.stringify(jobData.ai_taxonomies_a),
        jobData.ai_education_requirements,
    ];

    await pgClient.query(insertQuery, values);
}

async function main() {
    let connection;
    //Create connection to thedatabase
    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;
        console.log();

        const jobs = JSON.parse(fs.readFileSync("./data/jobs.json", "utf8"));

        await pgClient.query("TRUNCATE TABLE jobs");
        console.log("Table truncated");

        for (const job of jobs) {
            await insertJobPosting(pgClient, job);
            console.log(`job: ${job.id}`);
        }
    } catch (err) {
        console.error("Connection error:", err);
    }

    //Close connection to the database
    if (connection) {
        console.log();
        const { cleanup } = connection;
        cleanup();
        console.log("Connection closed");
    }
}

main();

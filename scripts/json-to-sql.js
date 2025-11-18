const { connectWithTunnel } = require("../config/postgres");
const fs = require("fs");

// Helper function to safely stringify JSON
const safeStringify = (value) => {
    if (value === null || value === undefined) return null;
    return JSON.stringify(value);
};

async function insertJobPosting(pgClient, jobData) {
    const insertQuery = `
    INSERT INTO jobs (
      "Address", "Latitude", "Longitude", "Name", address, addressCountry, 
      addressLocality, addressRegion, ai_benefits, ai_core_responsibilities, 
      ai_education_requirements, ai_employment_type, ai_experience_level, 
      ai_hiring_manager_email_address, ai_hiring_manager_name, ai_job_language, 
      ai_key_skills, ai_keywords, ai_remote_location, ai_remote_location_derived, 
      ai_requirements_summary, ai_salary_currency, ai_salary_maxvalue, 
      ai_salary_minvalue, ai_salary_unittext, ai_salary_value, ai_taxonomies_a, 
      ai_visa_sponsorship, ai_work_arrangement, ai_work_arrangement_office_days, 
      ai_working_hours, cities_derived, counties_derived, countries_derived, 
      currency, date_created, date_posttruncateed, date_validthrough, description_text, 
      domain_derived, employment_type, geo, id, latitude, lats_derived, 
      lngs_derived, location_requirements_raw, location_type, locations_alt_raw, 
      locations_derived, locations_raw, longitude, "maxValue", "minValue", name, 
      organization, organization_logo, organization_url, postOfficeBoxNumber, 
      postalCode, regions_derived, remote_derived, salary_raw, source, 
      source_domain, source_type, streetAddress, timezones_derived, title, 
      "unitText", url, value
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
      $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, 
      $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, 
      $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, 
      $63, $64, $65, $66, $67, $68, $69, $70, $71, $72
    )`;

    const values = [
        safeStringify(jobData.Address),
        jobData.Latitude,
        jobData.Longitude,
        jobData.Name,
        jobData.address,
        jobData.addressCountry,
        jobData.addressLocality,
        jobData.addressRegion,
        jobData.ai_benefits,
        jobData.ai_core_responsibilities,
        jobData.ai_education_requirements,
        safeStringify(jobData.ai_employment_type),
        jobData.ai_experience_level,
        jobData.ai_hiring_manager_email_address,
        jobData.ai_hiring_manager_name,
        jobData.ai_job_language,
        safeStringify(jobData.ai_key_skills),
        safeStringify(jobData.ai_keywords),
        jobData.ai_remote_location,
        jobData.ai_remote_location_derived,
        jobData.ai_requirements_summary,
        jobData.ai_salary_currency,
        jobData.ai_salary_maxvalue,
        jobData.ai_salary_minvalue,
        jobData.ai_salary_unittext,
        jobData.ai_salary_value,
        safeStringify(jobData.ai_taxonomies_a),
        jobData.ai_visa_sponsorship,
        jobData.ai_work_arrangement,
        jobData.ai_work_arrangement_office_days,
        jobData.ai_working_hours,
        safeStringify(jobData.cities_derived),
        safeStringify(jobData.counties_derived),
        safeStringify(jobData.countries_derived),
        jobData.currency,
        jobData.date_created,
        jobData.date_posted,
        jobData.date_validthrough,
        jobData.description_text,
        jobData.domain_derived,
        jobData.employment_type,
        safeStringify(jobData.geo),
        jobData.id,
        jobData.latitude,
        safeStringify(jobData.lats_derived),
        safeStringify(jobData.lngs_derived),
        jobData.location_requirements_raw,
        jobData.location_type,
        safeStringify(jobData.locations_alt_raw),
        safeStringify(jobData.locations_derived),
        safeStringify(jobData.locations_raw),
        jobData.longitude,
        jobData.maxValue,
        jobData.minValue,
        jobData.name,
        jobData.organization,
        jobData.organization_logo,
        jobData.organization_url,
        jobData.postOfficeBoxNumber,
        jobData.postalCode,
        safeStringify(jobData.regions_derived),
        jobData.remote_derived,
        jobData.salary_raw,
        jobData.source,
        jobData.source_domain,
        jobData.source_type,
        jobData.streetAddress,
        safeStringify(jobData.timezones_derived),
        jobData.title,
        jobData.unitText,
        jobData.url,
        jobData.value,
    ];

    await pgClient.query(insertQuery, values);
}

async function main() {
    let connection;
    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;
        console.log("main");

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

    if (connection) {
        console.log();
        const { cleanup } = connection;
        cleanup();
        console.log("Connection closed");
    }
}

main();

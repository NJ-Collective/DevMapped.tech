import {getTopJobs} from jobService.js
import {getJobFromDatabase} from jobService.js
import {weightJob} from embeddingService.js

export async function weightSkill(username) {

    const topJobs = JSON.parse(getTopJobs());

    topJobs.array.forEach(vectorEntry => {
        const job = getJobFromDatabase(vectorEntry.id)
        const jobSkills = job.ai_key_skills
        const weight = weightJob(vectorEntry, getUserVector(username))
    });
    
}

/*
    "id": "1891549277",

    "ai_key_skills": [
        "Leadership",
        "Operational Oversight",
        "Team Development",
        "Strategic Vision",
        "Organizational Communication",
        "Customer Journey Enhancement",
        "Budget Management",
        "Analytical Skills",
        "Problem-Solving",
        "Cross-Functional Collaboration",
        "Innovation",
        "Agility",
        "Brand Stewardship",
        "Stakeholder Management",
        "Process Improvement",
        "Product Development",
        "Marketing"
    ]
    */
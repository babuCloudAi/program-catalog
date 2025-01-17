import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const apiKey = "AIzaSyAyjld6U3wplgE0WNDN--RT2Hm3YUKp5Tk";

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

var results = {};

async function getResponse(careers) {
	for (const career of careers) {
		const prompt = `
      For a "${career}", generate the skills needed in the following four categories in JSON format:
      1. Technical and Digital Skills
      2. Interpersonal and Communication Skills
      3. Problem-Solving and Analytical Skills
      4. Organizational and Leadership Skills
      Output the result in the following format:
      {
        "${career.replace(/\s+/g, "")}": {
          "Skills": {
            "TechnicalAndDigitalSkills": [...],
            "InterpersonalAndCommunicationSkills": [...],
            "ProblemSolvingAndAnalyticalSkills": [...],
            "OrganizationalAndLeadershipSkills": [...]
          }
        }
      }
    `;

		const result = await chat.sendMessage(prompt);
		const response = await result.response;
		const skilltext = response.text();

		const cleanedText = skilltext.replace(/```json|```/g, "").trim();

		try {
			const skillsJSON = JSON.parse(cleanedText);
			Object.assign(results, skillsJSON);
		} catch (error) {
			console.error("Error parsing JSON:", error);
		}
	}

	fs.writeFileSync("courses.json", JSON.stringify(results, null, 2), "utf-8");
	console.log("Data saved to skillsData.json");
}

const careers = ["mechanical Engineer", "civil Engineer"];

getResponse(careers);

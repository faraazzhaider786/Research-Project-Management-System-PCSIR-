import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Center from "./models/Center.js";
import Complex from "./models/Complex.js";
import Employee from "./models/Employee.js";
import FieldOfStudy from "./models/FieldOfStudy.js";
import FundingAgency from "./models/FundingAgency.js";
import Lab from "./models/Lab.js";
import PSDPProject from "./models/PSDPProject.js";
import RNDProgram from "./models/RNDProgram.js";
import User from "./models/User.js";

dotenv.config();

const employees = [
  ["EMP001", "Ali Khan", "Principal Research Officer", "ali.khan@pcsir.gov.pk"],
  ["EMP002", "Ahmed Raza", "Senior Scientific Officer", "ahmed.raza@pcsir.gov.pk"],
  ["EMP003", "Usman Malik", "Research Officer", "usman.malik@pcsir.gov.pk"],
  ["EMP004", "Sara Ahmed", "Scientific Officer", "sara.ahmed@pcsir.gov.pk"],
  ["EMP005", "Fatima Noor", "Assistant Research Officer", "fatima.noor@pcsir.gov.pk"],
  ["DIRPND", "Director P&D", "Director P&D", "director.pnd@pcsir.gov.pk"],
  ["DIRRD", "Director R&D", "Director R&D", "director.rd@pcsir.gov.pk"]
];

const complexes = [
  ["Engineering Research Complex", "ERC", "Engineering and technology research complex."],
  ["Environmental Research Complex", "ENV", "Environmental and water research complex."],
  ["Chemical Research Complex", "CRC", "Chemical sciences and industrial research complex."],
  ["Materials Research Complex", "MRC", "Advanced materials and nanotechnology research complex."],
  ["Energy Research Complex", "ENC", "Renewable energy and energy-storage research complex."]
];

const centers = [
  ["Center for Artificial Intelligence", "CAI", "Center for AI and machine-learning research."],
  ["Center for Environmental Studies", "CES", "Center for environmental and sustainability research."],
  ["Center for Advanced Materials", "CAM", "Center for advanced materials development."],
  ["Center for Energy Research", "CER", "Center for renewable and sustainable energy research."],
  ["Center for Industrial Technology", "CIT", "Center for industrial technology and process development."]
];

const fields = [
  ["Artificial Intelligence", "Artificial intelligence, machine learning and intelligent systems."],
  ["Environmental Science", "Environmental monitoring, sustainability and climate research."],
  ["Materials Science", "Advanced materials, nanomaterials and material characterization."],
  ["Renewable Energy", "Solar energy, batteries and sustainable energy systems."],
  ["Industrial Chemistry", "Chemical processes, industrial materials and chemical analysis."]
];

const agencies = [
  ["Higher Education Commission", "Funding agency for higher-education research."],
  ["Pakistan Science Foundation", "National science and technology research funding agency."],
  ["Ministry of Science and Technology", "Government funding for science and technology programs."],
  ["National Research Program", "Funding program for national research initiatives."],
  ["International Research Organization", "International research collaboration and funding organization."]
];

const psdpProjects = [
  ["PSDP-2026-001", "National AI Research Infrastructure", "Development of national artificial-intelligence research infrastructure.", 2026, 2029],
  ["PSDP-2026-002", "Clean Water Monitoring Initiative", "Deployment of modern water-quality monitoring systems.", 2026, 2028],
  ["PSDP-2026-003", "Advanced Materials Development Program", "Research and development of advanced industrial materials.", 2026, 2030],
  ["PSDP-2026-004", "Renewable Energy Storage Program", "Development of batteries and renewable-energy storage systems.", 2026, 2029],
  ["PSDP-2026-005", "Industrial Technology Modernization", "Modernization of industrial research and production technologies.", 2026, 2028]
];

const upsert = async (model, filter, data) =>
  model.findOneAndUpdate(filter, data, {
    returnDocument: "after",
    upsert: true,
    setDefaultsOnInsert: true
  });

const seedDemoData = async () => {
  try {
    await connectDB();

    const employeeMap = {};
    for (const [employeeId, name, designation, email] of employees) {
      employeeMap[employeeId] = await upsert(
        Employee,
        { employeeId },
        { employeeId, name, designation, email }
      );
    }

    const complexMap = {};
    for (const [name, code, description] of complexes) {
      complexMap[code] = await upsert(
        Complex,
        { code },
        { name, code, description }
      );
    }

    const centerMap = {};
    for (const [name, code, description] of centers) {
      centerMap[code] = await upsert(
        Center,
        { code },
        { name, code, description }
      );
    }

    const fieldMap = {};
    for (const [name, description] of fields) {
      fieldMap[name] = await upsert(
        FieldOfStudy,
        { name },
        { name, description }
      );
    }

    const agencyMap = {};
    for (const [name, description] of agencies) {
      agencyMap[name] = await upsert(
        FundingAgency,
        { name },
        { name, description }
      );
    }

    const labData = [
      ["Computer Research Laboratory", "CRL", "ERC", "Artificial intelligence and software research laboratory."],
      ["Water Quality Laboratory", "WQL", "ENV", "Water testing and environmental monitoring laboratory."],
      ["Industrial Chemistry Laboratory", "ICL", "CRC", "Industrial chemistry and chemical-process laboratory."],
      ["Nanomaterials Laboratory", "NML", "MRC", "Nanomaterials and advanced materials laboratory."],
      ["Renewable Energy Laboratory", "REL", "ENC", "Solar, battery and renewable-energy laboratory."]
    ];
    const labMap = {};
    for (const [name, code, complexCode, description] of labData) {
      labMap[code] = await upsert(
        Lab,
        { code },
        { name, code, complex: complexMap[complexCode]._id, description }
      );
    }

    const psdpMap = {};
    for (const [referenceNumber, title, description, startYear, endYear] of psdpProjects) {
      psdpMap[referenceNumber] = await upsert(
        PSDPProject,
        { referenceNumber },
        { referenceNumber, title, description, startYear, endYear }
      );
    }

    const passwordHash = await bcrypt.hash("TestPass@123", 10);
    const directorPasswordHash = await bcrypt.hash("Director@123", 10);
    const userMap = {};

    for (const employeeId of ["EMP001", "EMP002", "EMP003", "EMP004", "EMP005"]) {
      const employee = employeeMap[employeeId];
      userMap[employeeId] = await upsert(
        User,
        { email: employee.email },
        {
          employee: employee._id,
          email: employee.email,
          password: passwordHash,
          role: "employee",
          isActive: true
        }
      );
    }

    userMap.DIRPND = await upsert(
      User,
      { email: "director.pnd@pcsir.gov.pk" },
      {
        employee: employeeMap.DIRPND._id,
        email: "director.pnd@pcsir.gov.pk",
        password: directorPasswordHash,
        role: "director_pnd",
        isActive: true
      }
    );
    userMap.DIRRD = await upsert(
      User,
      { email: "director.rd@pcsir.gov.pk" },
      {
        employee: employeeMap.DIRRD._id,
        email: "director.rd@pcsir.gov.pk",
        password: directorPasswordHash,
        role: "director_rd",
        isActive: true
      }
    );

    const adminUser = await User.findOne({ email: "admin@pcsir.gov.pk" });
    if (!adminUser) {
      throw new Error("Admin account not found. Run the seed:admin script first.");
    }

    const programs = [
      {
        title: "AI-Based Water Quality Monitoring System",
        rndType: "national",
        sourceOfRND: "RD&I of PCSIR",
        complex: complexMap.ERC._id,
        lab: labMap.CRL._id,
        center: centerMap.CAI._id,
        projectLeader: employeeMap.EMP001._id,
        associates: [employeeMap.EMP002._id, employeeMap.EMP003._id],
        fieldsOfStudy: [fieldMap["Artificial Intelligence"]._id, fieldMap["Environmental Science"]._id],
        year: 2026,
        duration: 24,
        scheduledCompletionDate: "2028-09-30",
        background: "Water-quality monitoring requires faster and more reliable analysis.",
        objective: "Develop an AI-based water-quality monitoring system.",
        researchHighlights: "Machine-learning models will analyze water-quality data.",
        presentStatus: "Initial project planning completed.",
        targetsNextFiscalYear: "Complete prototype development and field testing.",
        collaborators: "Pakistan Council of Research in Water Resources",
        keywords: ["AI", "Water Quality", "Machine Learning"],
        fundingAgency: agencyMap["Higher Education Commission"]._id,
        fundsAllocatedDetails: "PKR 25 million allocated for the project.",
        psdpProject: psdpMap["PSDP-2026-002"]._id,
        socioEconomicOutcome: "Improved water-quality monitoring and public-health protection.",
        graphicalAbstract: "https://example.com/water-quality.png",
        createdBy: adminUser._id
      },
      {
        title: "Solar Battery Storage Optimization",
        rndType: "national",
        sourceOfRND: "PSDP Project",
        complex: complexMap.ENC._id,
        lab: labMap.REL._id,
        center: centerMap.CER._id,
        projectLeader: employeeMap.EMP002._id,
        associates: [employeeMap.EMP005._id],
        fieldsOfStudy: [fieldMap["Renewable Energy"]._id],
        year: 2026,
        duration: 36,
        scheduledCompletionDate: "2029-12-31",
        background: "Energy storage is essential for reliable renewable-energy deployment.",
        objective: "Improve battery performance for solar-energy applications.",
        researchHighlights: "Battery lifecycle and charging optimization research.",
        presentStatus: "Laboratory testing is being planned.",
        targetsNextFiscalYear: "Complete battery-cell testing.",
        collaborators: "National Energy Research Institute",
        keywords: ["Solar Energy", "Battery", "Energy Storage"],
        fundingAgency: agencyMap["Pakistan Science Foundation"]._id,
        fundsAllocatedDetails: "PKR 40 million allocated for laboratory equipment.",
        psdpProject: psdpMap["PSDP-2026-004"]._id,
        socioEconomicOutcome: "Improved renewable-energy reliability.",
        graphicalAbstract: "https://example.com/solar-storage.png",
        createdBy: adminUser._id
      }
    ];

    for (const program of programs) {
      await upsert(RNDProgram, { title: program.title }, program);
    }

    console.log("Demo data seeded successfully.");
    console.log("Employee test password: TestPass@123");
    console.log("Director test password: Director@123");
  } catch (error) {
    console.error("Demo data seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDemoData();

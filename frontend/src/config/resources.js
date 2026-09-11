export const referenceResources = {
  employees: {
    label: "Employees",
    singular: "Employee",
    endpoint: "/employees",
    description: "Maintain the researchers and staff available to lead projects.",
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "designation", label: "Designation" },
      { key: "email", label: "Email" }
    ],
    fields: [
      { name: "employeeId", label: "Employee ID", required: true },
      { name: "name", label: "Full name", required: true },
      { name: "designation", label: "Designation", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "complex", label: "Complex", type: "select", source: "complexes" },
      { name: "lab", label: "Lab", type: "select", source: "labs" },
      { name: "center", label: "Center", type: "select", source: "centers" }
    ]
  },
  complexes: {
    label: "Complexes",
    singular: "Complex",
    endpoint: "/complexes",
    description: "Manage PCSIR research complexes and their identifying codes.",
    columns: [{ key: "name", label: "Name" }, { key: "code", label: "Code" }, { key: "description", label: "Description" }],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "code", label: "Code", required: true },
      { name: "description", label: "Description", type: "textarea" }
    ]
  },
  labs: {
    label: "Labs",
    singular: "Lab",
    endpoint: "/labs",
    description: "Manage laboratories and their parent complexes.",
    columns: [{ key: "name", label: "Name" }, { key: "code", label: "Code" }, { key: "complex", label: "Complex" }, { key: "description", label: "Description" }],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "code", label: "Code", required: true },
      { name: "complex", label: "Complex", type: "select", source: "complexes", required: true },
      { name: "description", label: "Description", type: "textarea" }
    ]
  },
  centers: {
    label: "Centers",
    singular: "Center",
    endpoint: "/centers",
    description: "Manage research centers and their identifying codes.",
    columns: [{ key: "name", label: "Name" }, { key: "code", label: "Code" }, { key: "description", label: "Description" }],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "code", label: "Code", required: true },
      { name: "description", label: "Description", type: "textarea" }
    ]
  },
  fields: {
    label: "Fields of Study",
    singular: "Field of Study",
    endpoint: "/fields-of-study",
    description: "Classify programs by their scientific and technical discipline.",
    columns: [{ key: "name", label: "Name" }, { key: "description", label: "Description" }],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "description", label: "Description", type: "textarea" }
    ]
  },
  agencies: {
    label: "Funding Agencies",
    singular: "Funding Agency",
    endpoint: "/funding-agencies",
    description: "Keep the agencies that can fund or sponsor research.",
    columns: [{ key: "name", label: "Name" }, { key: "description", label: "Description" }],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "description", label: "Description", type: "textarea" }
    ]
  },
  psdp: {
    label: "PSDP Projects",
    singular: "PSDP Project",
    endpoint: "/psdp-projects",
    description: "Manage public sector development projects linked to R&D work.",
    columns: [
      { key: "referenceNumber", label: "Reference" },
      { key: "title", label: "Title" },
      { key: "startYear", label: "Start year" },
      { key: "endYear", label: "End year" }
    ],
    fields: [
      { name: "referenceNumber", label: "Reference number", required: true },
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "startYear", label: "Start year", type: "number" },
      { name: "endYear", label: "End year", type: "number" }
    ]
  }
};

export const navGroups = [
  {
    label: "Workspace",
    links: [{ to: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" }, { to: "/rnd-programs", label: "R&D programs", icon: "FlaskConical" }]
  },
  {
    label: "Reference data",
    links: [
      { to: "/employees", label: "Employees", icon: "Users" },
      { to: "/complexes", label: "Complexes", icon: "Building2" },
      { to: "/labs", label: "Labs", icon: "Microscope" },
      { to: "/centers", label: "Centers", icon: "Landmark" },
      { to: "/fields-of-study", label: "Fields of study", icon: "BookOpen" },
      { to: "/funding-agencies", label: "Funding agencies", icon: "Banknote" },
      { to: "/psdp-projects", label: "PSDP projects", icon: "ClipboardList" }
    ]
  },
  {
    label: "Administration",
    links: [{ to: "/user-accounts", label: "User accounts", icon: "UserCog", adminOnly: true }]
  }
];

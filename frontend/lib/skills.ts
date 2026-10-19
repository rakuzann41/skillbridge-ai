export const skills = [
  {
    id: "python",
    name: "Python",
    description: "Variables, functions, and simple scripts",
    group: "Working with data",
  },
  {
    id: "sql",
    name: "SQL",
    description: "Queries, joins, and aggregations",
    group: "Working with data",
  },
  {
    id: "excel",
    name: "Excel",
    description: "Formulas, tables, and spreadsheets",
    group: "Working with data",
  },
  {
    id: "pandas",
    name: "pandas",
    description: "DataFrames and data exploration",
    group: "Working with data",
  },
  {
    id: "relational-databases",
    name: "Relational databases",
    description: "Tables, keys, and relationships",
    group: "Working with data",
  },
  {
    id: "data-cleaning",
    name: "Data cleaning",
    description: "Missing values and inconsistent records",
    group: "Making sense of data",
  },
  {
    id: "statistics",
    name: "Statistics",
    description: "Distributions, averages, and uncertainty",
    group: "Making sense of data",
  },
  {
    id: "data-visualization",
    name: "Data visualization",
    description: "Choosing and explaining useful charts",
    group: "Making sense of data",
  },
  {
    id: "power-bi",
    name: "Power BI",
    description: "Data models and interactive reports",
    group: "Tools & communication",
  },
  {
    id: "tableau",
    name: "Tableau",
    description: "Visual analysis and dashboards",
    group: "Tools & communication",
  },
  {
    id: "git",
    name: "Git",
    description: "Tracking and sharing code changes",
    group: "Tools & communication",
  },
] as const;

export const levels = [
  { value: "not-yet", label: "Not yet" },
  { value: "learning", label: "Learning" },
  { value: "comfortable", label: "Comfortable" },
] as const;

export type SkillId = (typeof skills)[number]["id"];
export type SkillLevel = (typeof levels)[number]["value"];

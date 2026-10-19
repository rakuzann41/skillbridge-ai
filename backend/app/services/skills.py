"""Small reviewed vocabulary; aliases never imply additional related skills."""

from app.schemas.profile import SkillId

SKILLS: dict[SkillId, tuple[str, tuple[str, ...]]] = {
    "python": ("Python", ("python",)),
    "sql": ("SQL", ("sql", "t-sql")),
    "excel": ("Excel", ("excel", "microsoft excel", "ms excel")),
    "statistics": ("Statistics", ("statistics", "statistical analysis")),
    "pandas": ("pandas", ("pandas",)),
    "power-bi": ("Power BI", ("power bi", "powerbi")),
    "tableau": ("Tableau", ("tableau",)),
    "data-cleaning": ("Data cleaning", ("data cleaning", "data cleansing")),
    "data-visualization": ("Data visualization", ("data visualization", "data visualisation")),
    "git": ("Git", ("git",)),
    "relational-databases": ("Relational databases", (
        "relational databases", "relational database", "postgresql", "postgres", "mysql",
    )),
}


def skill_name(skill_id: SkillId) -> str:
    return SKILLS[skill_id][0]

from mealie.schema._mealie import MealieModel


class AppStatistics(MealieModel):
    total_recipes: int
    total_users: int
    total_households: int
    total_groups: int
    uncategorized_recipes: int
    untagged_recipes: int


class AppInfo(MealieModel):
    production: bool
    version: str
    demo_status: bool
    allow_signup: bool
    allow_password_login: bool
    default_group_slug: str | None = None
    default_household_slug: str | None = None
    enable_oidc: bool
    oidc_redirect: bool
    oidc_provider_name: str
    enable_openai: bool
    enable_openai_image_services: bool


class AppTheme(MealieModel):
    light_primary: str = "#E85C60"
    light_accent: str = "#D9A74A"
    light_secondary: str = "#F6ADAB"
    light_success: str = "#A3CEA2"
    light_info: str = "#304F65"
    light_warning: str = "#C68A2C"
    light_error: str = "#D22C39"

    dark_primary: str = "#E85C60"
    dark_accent: str = "#D9A74A"
    dark_secondary: str = "#FACFCE"
    dark_success: str = "#A3CEA2"
    dark_info: str = "#72A2BE"
    dark_warning: str = "#ECD69C"
    dark_error: str = "#F07C7C"


class AppStartupInfo(MealieModel):
    is_first_login: bool
    """
    The applications best guess that a user hasn't logged in. Currently, it really
    on indicates that the 'changeme@example.com' user is still in the database. Once
    it is removed, this will always return False.
    """

    is_demo: bool


class AdminAboutInfo(AppInfo):
    versionLatest: str
    api_port: int
    api_docs: bool
    db_type: str
    db_url: str | None = None
    default_group: str
    default_household: str
    build_id: str
    recipe_scraper_version: str


class CheckAppConfig(MealieModel):
    email_ready: bool
    ldap_ready: bool
    oidc_ready: bool
    enable_openai: bool
    base_url_set: bool
    is_up_to_date: bool

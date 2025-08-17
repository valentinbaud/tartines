from pydantic_settings import BaseSettings, SettingsConfigDict


class Theme(BaseSettings):
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
    model_config = SettingsConfigDict(env_prefix="theme_", extra="allow")

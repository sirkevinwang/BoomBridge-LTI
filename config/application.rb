require_relative 'boot'
require "rails"
# Pick the frameworks you want: 
require "active_model/railtie" 
require "active_job/railtie"
# require "active_record/railtie" 
require "action_controller/railtie" 
# require "action_mailer/railtie" 
# require "action_cable/railtie" 
require "action_view/railtie" 
require "sprockets/railtie" 
require "rails/test_unit/railtie"

# Load the app's custom environment variables here, so that they are loaded before environments/*.rb

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Template
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # load LTI settings as environment variable
    config.lti_settings = config_for(:lti_settings)
  end
end

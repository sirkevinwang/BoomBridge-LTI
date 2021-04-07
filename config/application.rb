require_relative 'boot'
# require 'rails/all'
# require 'active_storage/engine'
require 'action_controller/railtie'
# require 'action_view/railtie'
require 'action_mailer/railtie'
# require 'active_job/railtie'
# require 'action_cable/engine'
require 'action_text/engine'
# require 'rails/test_unit/railtie'
require 'sprockets/railtie'
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

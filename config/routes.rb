Rails.application.routes.draw do
  root 'application#index'

  # LTI XML CONFIG
  get :lti_config, controller: :application, as: :lti_config

  # LTI LAUNCH URL (responds to get and post)
  match 'launch' => 'application#launch', via: [:get, :post], as: :lti_launch
  match '/' => 'application#launch', via: [:get, :post]

  # Link to privacy page
  get 'privacy', to: 'application#privacy', as: :lti_privacy

  # Grade callback: grades assignment
  post 'grade', to: 'application#grade', as: :lti_grade
end

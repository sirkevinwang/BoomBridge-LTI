Rails.application.routes.draw do
  root 'application#index'

  # LTI XML CONFIG
  get :lti_config, controller: :application, as: :lti_config

  # LTI LAUNCH URL (responds to get and post)
  match 'launch' => 'application#launch', via: [:get, :post], as: :lti_launch
  match '/' => 'application#launch', via: [:get, :post]
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  # Link to privacy page
  get 'privacy', to: 'application#privacy', as: :lti_privacy

  # testing purposes only
  # post 'grade/:correct_pts/:total_pts', to: 'application#grade', as: :lti_grade
  post 'grade', to: 'application#grade', as: :lti_grade
  get 'success', to: 'application#success', as: :lti_success
end

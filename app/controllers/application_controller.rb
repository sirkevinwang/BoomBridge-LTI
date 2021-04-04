# required for LTI
require 'ims/lti'
# Used to validate oauth signatures
require 'oauth/request_proxy/action_controller_request'
require 'oauth/request_proxy/rack_request'


class ApplicationController < ActionController::Base
  # protect_from_forgery with: :exception
  # CSRF stuff ^

  # LTI Launch endpoint (responds to POST and GET - see routes.rb)
  # checks for required query params
  # checks that the oauth signature checks out
  # read more about IMS::LTI in ims-lti gem https://github.com/instructure/ims-lti
  # note the oauth nonce is not handled within ims-lti gem, it's up to you
  def launch
    authenticator = IMS::LTI::Services::MessageAuthenticator.new(
       request.url,
       request.request_parameters,
       Rails.application.config.lti_settings['consumer_secret']
     )

    if not authenticator.valid_signature?
        # the request wasnt validated :(
      render :launch_error, status: 401
      return
    end

    # The providre request is valid
    # store the values you need from the LTI
    # here we're just tossing them into the session
    session[:user_id] = params.require :user_id
    session[:lis_person_name_full] = params.require :lis_person_name_full

    # stores the result_sourceid for grade passback
    session[:lis_result_sourcedid] = params.require :lis_result_sourcedid unless params[:lis_result_sourcedid].nil?
    # stores the url for grade passback
    session[:lis_outcome_service_url] = params.require :lis_outcome_service_url unless params[:lis_outcome_service_url].nil?
    # TODO: stores the canvas max points

    # set variables for use by the template
    @lis_person_name_full = session[:lis_person_name_full]
  end

  def grade
    # FIXME: when boom is up, use the floating point score calculated from the OCR image result
    session[:score] = params[:score]
    score = params[:score].to_f / 15
    # Cited from: https://github.com/instructure/lti_example/blob/master/lti_example.rb
    xml = %{
    <?xml version = "1.0" encoding = "UTF-8"?>
    <imsx_POXEnvelopeRequest xmlns = "http://www.imsglobal.org/lis/oms1p0/pox">
      <imsx_POXHeader>
        <imsx_POXRequestHeaderInfo>
          <imsx_version>V1.0</imsx_version>
          <imsx_messageIdentifier>12341234</imsx_messageIdentifier>
        </imsx_POXRequestHeaderInfo>
      </imsx_POXHeader>
      <imsx_POXBody>
        <replaceResultRequest>
          <resultRecord>
            <sourcedGUID>
              <sourcedId>#{session[:lis_result_sourcedid]}</sourcedId>
            </sourcedGUID>
            <result>
              <resultScore>
                <language>en</language>
                <textString>#{score}</textString>
              </resultScore>
            </result>
          </resultRecord>
        </replaceResultRequest>
      </imsx_POXBody>
    </imsx_POXEnvelopeRequest>
    }
    consumer = OAuth::Consumer.new(Rails.application.config.lti_settings['consumer_key'],  Rails.application.config.lti_settings['consumer_secret'])
    token = OAuth::AccessToken.new(consumer)
    response = token.post(session[:lis_outcome_service_url], xml, 'Content-Type' => 'application/xml')
    
    if response.body.match(/\bsuccess\b/)
      # success
      render :success
      return
    else 
      # handle err here
      puts response.body
      render :error
      return
    end
  end 
  # lTI XML Configuration
  # Used for easily installing your LTI into an LMS
  def lti_config
    render template: "application/lti_config.xml"
  end

end

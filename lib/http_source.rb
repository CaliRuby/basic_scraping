require 'nokogiri'
require 'open-uri'

class HttpSource

  def initialize(url)
    @url = url
  end

  def source
    response = open(@url)
    @xml     = Nokogiri::XML(response.read)
  end

end

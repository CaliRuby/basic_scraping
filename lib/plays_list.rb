require 'nokogiri'
require 'open-uri'

class PlaysList
  def initialize
    @url = "http://www.ibiblio.org/xml/examples/shakespeare/"
  end
  def get
    response = open(@url)
    @html    = Nokogiri::HTML(response.read)
    self
  end
  def list
    extract_names_and_urls = lambda do |doc|
      [@url + doc.attr('href'), doc.text]
    end
    @html.css('a').map(&extract_names_and_urls)
  end

end

require 'nokogiri'

class XmlSource
  def initialize(path)
      @path = path
  end
  def source
      file  = File.open(@path)
        @xml  = Nokogiri::XML(file)
  end

end

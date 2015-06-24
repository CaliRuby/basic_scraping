require 'spec_helper'

describe HttpSource do
  before do
    path = path = "spec/fixtures/macbeth.html"
    response = File.new(path).read
    stub_request(:get, /.*www.ibiblio.org.*/).to_return(response)
  end

  subject { HttpSource.new("http://www.ibiblio.org/xml/examples/shakespeare/macbeth.xml") }

  describe '#source' do
    it 'returns nokogiri object' do
      expect(subject.source).to be_a Nokogiri::XML::Document
    end
  end

end

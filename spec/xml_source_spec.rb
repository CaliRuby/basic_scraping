require 'spec_helper'

describe XmlSource do

  subject { XmlSource.new("spec/fixtures/macbeth.xml") }

  describe '#source' do
    it 'returns nokogiri object' do
      expect(subject.source).to be_a Nokogiri::XML::Document
    end
  end

end

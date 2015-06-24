require 'spec_helper'
require 'nokogiri'

describe PlayAnalyzer do
  let(:source) { Nokogiri::XML(File.new('spec/fixtures/macbeth.xml').read) }
  let(:source_type) { double(source: source)}
  subject { PlayAnalyzer.new(source_type) }

  describe '#characters' do
    it 'returns Macbeth characters' do
      expect(subject.characters).to include('MACBETH', 'BANQUO', 'DUNCAN')
    end
  end

  describe '#characters_spoken_lines' do
    it 'returns lines spoken by characters' do
      expected = [
        ['MACBETH', 719], ['BANQUO', 113], ['DUNCAN', 70]
      ]
      expect(subject.characters_spoken_lines.to_a).to include(*expected)
    end
  end

  describe '#words_by_characters' do
    it 'returns words and its frequency spoken by a given character' do
      results = subject.words_by_characters('MACBETH')
      expect(results).to include(["they", 24],
                                ["thy", 24]
                                )
    end
  end
end

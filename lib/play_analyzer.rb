class PlayAnalyzer

  def initialize(source_type)
    @source_type = source_type
    @source      = source_type.source
  end

  def words_by_characters name
    word_count = Hash.new(0)
    @source.xpath('//SPEAKER').select do |s|
      s.text == name
    end.each do |e|
      words = e.parent.css('LINE').flat_map { |l| l.text.downcase.split }
      words.each { |w|  word_count[w] += 1 }
    end
    word_count.sort_by { |k, v| v }.reverse
  end

  def characters
    @source.css("//SPEAKER").map{|w| w.text }
  end

  def characters_spoken_lines
    counter = Hash.new(0)
    @source.css("SPEAKER").map do |s|
      [s.text, s.parent.css("LINE").count]
    end.each do |tuple|
      counter[tuple.first] += tuple.last
    end
    counter
  end

end

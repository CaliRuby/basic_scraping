#fun using classes
require_relative '../lib/http_source.rb'
require_relative '../lib/play_analyzer.rb'
require_relative '../lib/plays_list.rb'
require_relative '../lib/xml_source.rb'

command = ""
while(command != -1) do
  plays = PlaysList.new.get.list
  plays.each_with_index do | pair, index |
    print "#{index} \- #{pair.last}\n"
  end

  puts "Please enter the play index you want to analyze ?"
  print "play number: "
  command = gets.chomp

  puts "\n\n Play Name: \n"
  play_pair = plays[command.to_i] rescue plays.first
  puts play_pair.last

  puts "\n\n 1. Characters \n 2. Exit to Plays list\n"
  print "write option: "

  command = gets.chomp.to_i

  if command == 1

    pa = PlayAnalyzer.new(HttpSource.new(play_pair.first))
    characters = pa.characters_spoken_lines.map{|c| c.first}
    pa.characters_spoken_lines.each_with_index do |(k, v), index|
    puts "#{index} - #{k} spoke #{v} words."
    end

    puts "\n\nTo character words please enter character number"\
      "\nto Exit to play list press enter\n"
    command = gets.chomp.to_i
    words = pa.words_by_characters characters[command] rescue ["no words"]
    words.each{|w| print "(" + w.first + ": " + w.last.to_s + "),  " }
    puts "Press enter to continue!"
    command = gets.chomp
  else
  end

end

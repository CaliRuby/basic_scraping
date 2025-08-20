require 'sinatra'
require 'json'
require_relative 'lib/http_source'
require_relative 'lib/play_analyzer'
require_relative 'lib/plays_list'
require_relative 'lib/xml_source'

# Configure Sinatra
configure do
  set :port, 4567
  set :bind, '0.0.0.0'
  set :public_folder, 'public'
  set :views, 'views'
end

# Global variables for caching
$plays_cache = nil
$analysis_cache = {}

# Helper methods
helpers do
  def get_plays_list
    return $plays_cache if $plays_cache
    begin
      plays_list = PlaysList.new.get
      $plays_cache = plays_list.list
    rescue => e
      puts "Error fetching plays: #{e.message}"
      $plays_cache = []
    end
    $plays_cache
  end

  def analyze_play(play_url)
    return $analysis_cache[play_url] if $analysis_cache[play_url]
    
    begin
      analyzer = PlayAnalyzer.new(HttpSource.new(play_url))
      
      analysis = {
        characters: analyzer.characters.uniq,
        characters_lines: analyzer.characters_spoken_lines.to_a.sort_by { |_, count| -count },
        total_characters: analyzer.characters.uniq.length,
        total_lines: analyzer.characters_spoken_lines.values.sum
      }
      
      # Add word analysis for top 5 characters
      analysis[:word_analysis] = {}
      analysis[:characters_lines].first(5).each do |char_name, _|
        analysis[:word_analysis][char_name] = analyzer.words_by_characters(char_name).first(10)
      end
      
      $analysis_cache[play_url] = analysis
    rescue => e
      puts "Error analyzing play: #{e.message}"
      $analysis_cache[play_url] = { error: e.message }
    end
    
    $analysis_cache[play_url]
  end

  def get_play_name(play_url)
    plays = get_plays_list
    play_pair = plays.find { |url, name| url == play_url }
    play_pair ? play_pair[1] : "Unknown Play"
  end
end

# Routes
get '/' do
  @plays = get_plays_list
  erb :index
end

get '/dashboard' do
  @plays = get_plays_list
  @total_plays = @plays.length
  erb :dashboard
end

get '/characters/:play_index' do
  @plays = get_plays_list
  play_index = params[:play_index].to_i
  
  if play_index >= 0 && play_index < @plays.length
    @play_url = @plays[play_index][0]
    @play_name = @plays[play_index][1]
    @analysis = analyze_play(@play_url)
    erb :characters
  else
    redirect '/'
  end
end

get '/words/:play_index' do
  @plays = get_plays_list
  play_index = params[:play_index].to_i
  
  if play_index >= 0 && play_index < @plays.length
    @play_url = @plays[play_index][0]
    @play_name = @plays[play_index][1]
    @analysis = analyze_play(@play_url)
    erb :words
  else
    redirect '/'
  end
end

get '/comparison' do
  @plays = get_plays_list
  erb :comparison
end

get '/reports' do
  @plays = get_plays_list
  erb :reports
end

# API endpoints for AJAX requests
get '/api/play/:play_index' do
  content_type :json
  
  plays = get_plays_list
  play_index = params[:play_index].to_i
  
  if play_index >= 0 && play_index < plays.length
    play_url = plays[play_index][0]
    analysis = analyze_play(play_url)
    analysis.to_json
  else
    { error: "Invalid play index" }.to_json
  end
end

get '/api/compare/:play1/:play2' do
  content_type :json
  
  plays = get_plays_list
  play1_index = params[:play1].to_i
  play2_index = params[:play2].to_i
  
  if play1_index >= 0 && play1_index < plays.length && 
     play2_index >= 0 && play2_index < plays.length
    
    play1_url = plays[play1_index][0]
    play2_url = plays[play2_index][0]
    
    analysis1 = analyze_play(play1_url)
    analysis2 = analyze_play(play2_url)
    
    comparison = {
      play1: {
        name: plays[play1_index][1],
        analysis: analysis1
      },
      play2: {
        name: plays[play2_index][1],
        analysis: analysis2
      }
    }
    
    comparison.to_json
  else
    { error: "Invalid play indices" }.to_json
  end
end

# Character word analysis endpoint
get '/api/character_words/:play_index/:character' do
  content_type :json
  
  plays = get_plays_list
  play_index = params[:play_index].to_i
  character = params[:character]
  
  if play_index >= 0 && play_index < plays.length
    play_url = plays[play_index][0]
    
    begin
      analyzer = PlayAnalyzer.new(HttpSource.new(play_url))
      words = analyzer.words_by_characters(character).first(20)
      { character: character, words: words }.to_json
    rescue => e
      { error: e.message }.to_json
    end
  else
    { error: "Invalid play index" }.to_json
  end
end

# Start the server
if __FILE__ == $0
  Sinatra::Application.run!
end

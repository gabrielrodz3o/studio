// Offline provider: evaluates saved candidates without contacting any AI service.
class FixtureProvider {id(){return 'studio:fixtures'}async callApi(prompt){return {output:prompt,cost:0}}}
module.exports=FixtureProvider

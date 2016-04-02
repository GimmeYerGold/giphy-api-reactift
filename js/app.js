// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

import fetch from "isomorphic-fetch"

import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'bbfire'

// http://api.giphy.com/v1/gifs/search?q=funny+cat&api_key=dc6zaTOxFJmzC 

// api_key - The public beta key is "dc6zaTOxFJmzC"

function app() {
    // start app
    // new Router()

    var GiphyModel = Backbone.Model.extend({
    	defaults: {
    		"fave":false,
    	}
    })

    var GiphyCollection = Backbone.Collection.extend ({
    	url: "http://api.giphy.com/v1/gifs/search",
    	apiKey: "dc6zaTOxFJmzC",

    	parse: function(rawData){
    
            return rawData.data
        },

        model:GiphyModel
    })

    var FavesCollection = Backbone.Firebase.Collection.extend({
    	url: "https://giphybase.firebaseio.com/favegiphys"
    })

    var GiphyRouter = Backbone.Router.extend({
    	routes: {
    		"favorites": "handleFaves",
    		"*default" : "handleGiphys"
    	},

    	handleGiphys: function(query){
    		var fc = new FavesCollection()
    		var gc = new GiphyCollection()
    		gc.reset.bind(this)
			gc.fetch ({
    			data: {
	    			"api_key": gc.apiKey,
	    			"q": query
    			}
    			}).then(function(){
    			DOM.render(<GiphyView giphyType="all" query={query} giphyColl={gc} faveColl={fc} />, document.querySelector('.container'))
    		})
		},
    	
    	handleFaves: function() {
    		DOM.render(<GiphyView giphyType="faves" giphyColl={new FavesCollection} />, document.querySelector('.container'))
    	},

    	initialize: function() {
    		Backbone.history.start()
    	}
    }) 

    var GiphyView = React.createClass({

    _handleSearch: function(event){
    	
    	var query = event.currentTarget.search.value

    	location.hash = query
    },	

	// componentWillMount: function(){
	// 	var self = this
	// 	self.props.giphyColl.on("sync reset", function() {self.forceUpdate()})
	// },

	// componentWillUnmount: function(){
	// 	var self = this
	// 	self.props.giphyColl.off("sync reset")
	// },

	render: function(){

		return (
			<div className="giphyView">
			<h1>{this.props.query}</h1>
			<form onSubmit={this._handleSearch}>
			<input className="searchBar" type="text" placeholder="search..." id="search"/> 
			</form>
				<GiphyList giphyColl={this.props.giphyColl.models} faveColl={this.props.faveColl} />		
			</div>
			)	
		}
	})	
	
    var GiphyList = React.createClass ({
    	_makeGiphyComponent: function(model, id) {
    		return <Giphy giphyData={model} key={id} faveColl={this.props.faveColl} updater={this._updater} />
    		console.log(model)
    	},

    	_updater: function(){
    		this.setState({
    			giphyColl: this.state.giphyColl
    		})
    	},

    	getInitialState: function(){
    		return{
    			giphyColl: this.props.giphyColl
    		}
    	},

    	render: function(){

    		return (
    			<div className="giphyList">
    				{this.props.giphyColl.map(this._makeGiphyComponent)}
    			</div>	
    		)
    	}
    })

    var Giphy = React.createClass ({

    	_handleComment: function(){

    	},

    	render: function(){

    		var giphyModel = this.props.giphyModel

    		return (
    			<div className="giphy">
    				<img src={this.props.giphyData.attributes.images.original.url}/>
    				<div className="interactive"><button className="heart">&#10084;</button><form onSubmit={this._handleComment}>
    				 <input className="comment" type="text" id="comment" placeholder="add a comment..."/>
    				</form>
    				</div>
    			</div>
    		)
    	}		
    })

    var gr = new GiphyRouter()

}

app()

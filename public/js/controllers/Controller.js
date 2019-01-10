angular.module('Controller', []).controller('Controller', function($scope, $state, $stateParams, $window, Url) {

	this.urls = [];
	this.url = '';

	this.searchString = '';

	this.fetchAll = function() {
		Url.fetchAll()
		  .then(response => {
		  	this.urls = response.data;
		  })
		  .catch((error) => {
		    console.log(error)
		  });
	}

	this.add = function() {
		Url.create(this.url)
		  .then(response => {
		  	for (url of response.data) {
		  		this.urls.unshift(url)
		  	}
		  })
		  .catch((error) => {
		  	$scope.formError = error.data.message;
		    console.log(error)
		  });
	}

	this.search = function() {
		this.loading = true;
		Url.search(this.searchString)
		  .then(response => {
		  	this.urls = response.data;
		  	this.loading = false;
		  	console.log(this.urls)
		  })
		  .catch((error) => {
		  	this.loading = false;
		    console.log(error)
		  });
	}

	this.delete = function(id) {
		Url.delete(id)
			.then(response => {
				this.urls = this.urls.filter((url) => url.id !== id);
		  })
		  .catch((error) => {
		    console.log(error)
		  });
	}

})

.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);
angular.module('Url', []).service('Url', ['$http', function($http) {

  this.create = function(url) {
    return $http.post('/api/urls', {'url': url});
  }

  this.fetchAll = function() {
    return $http.get('/api/urls');
  }

  this.search = function(searchString) {
    return $http.get('/api/urls/search?q=' + encodeURIComponent(searchString));
  }

  this.delete = function(id) {
    return $http.delete('/api/urls/' + id);
  }

}]);
'use strict';

angular.module('takhshilaApp')
  .controller('SettingsCtrl', function ($rootScope, $scope, User, userFactory, Auth) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
    };

    $scope.saveSettings = function(settingsForm){
      var updateData = {
        name: {
          firstName: $scope.user.name.firstName,
          lastName: $scope.user.name.lastName
        },
        email: $scope.user.email,
        phone: $scope.user.phone
      }
      console.log(updateData);
      userFactory.saveSettings(updateData)
      .success(function(response){
        console.log(response);
        $rootScope.currentUser.name = response.data.name;
      })
      .error(function(err){
        console.log(err);
      })
      // if($rootScope.currentUser.phone !== $scope.user.phone){
      //   console.log("Phone number has changed");
      // }
      // if($rootScope.currentUser.email !== $scope.user.email){
      //   console.log("Email has changed");
      // }
    }
    
    $rootScope.$watch('loggedIn', function(status){
      if(status === true){
        $rootScope.isLoading = false;
        $scope.user = {
          name: {
            firstName: $rootScope.currentUser.name.firstName,
            lastName: $rootScope.currentUser.name.lastName
          },
          email: $rootScope.currentUser.email,
          phone: $rootScope.currentUser.phone,
          country: $rootScope.currentUser.country
        };
        $scope.selectedCountry = {};
        for(var i = 0; i < $rootScope.countries.length; i++){
          if($rootScope.countries[i]._id === $scope.user.country){
            $scope.selectedCountry = $rootScope.countries[i];
            break;
          }
        }
        console.log($scope.user);
        console.log($scope.selectedCountry);
      }
    });
  });

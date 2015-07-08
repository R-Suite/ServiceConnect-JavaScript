
describe("Bus", function() {

	describe("initialize", function() {

		beforeEach(function(){
			spyOn(window, 'Consumer').and.returnValue({});
			spyOn(window, 'Producer').and.returnValue({});
		});

		it("should execute callback function", function() {
			var callback = sinon.spy();
			var bus = Bus.initialize(callback);
	    	expect(callback).toHaveBeenCalled();
	 	});

	 	it("setting config in callback function should set bus config", function() {
	    	
	 	});

	 	it("should start consuming", function() {
	    	
	 	});

	 	it("should create a producer", function() {
	    	
	 	});	 	

	 	it("should execute onConnect callback once producer and consumer have connected", function() {
	    	
	 	});	 

	});
  
});
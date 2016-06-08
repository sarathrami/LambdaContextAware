function* fibonacci(event, context) {
  var old_val = 0;
  var new_val = 1;
  var collect = [];
  var i = 1;
  while(true){
	  collect.push(old_val);
	  var tmp = old_val;
	  old_val = new_val;
	  new_val += tmp;
	  if(i++ >= (event.n || 1)){
		 var ret = collect;
		 collect = [];
		 i = 1;
		 yield ret;
	  }
  }
}

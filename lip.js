/**
*  Creative Commons Austria 3.0 By Name, Non-Commercial, Same Attribution license
*  autor klaus@hammermueller.at
**/
//some security features
//----------------------
//adapted from String.hashCode()
function hash(str) {
  var h = 1275801696342597; // prime
  var len = str.length;
  if (len < 1) return h;
  for (var i = 0; i < len; i++) {
    var c = str.charCodeAt(i);
    h = ((h<<5)-h)+c;
    h = h & h;  // Convert to 32bit integer
  }
  return h;
} 

//base64 encoding chars for url (last two chars are non-standard)
var base64_chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.";
//generate a random base64 string
function generateRandomString(len) {
	var randomString = '';
	for (var i = 0; i < len; i++) {
		randomString = randomString + base64_chars.substr(Math.floor((Math.random() * base64_chars.length-1)),1);
	}	
	return randomString;
}

//constructor for a crypto object to en/decrypt names, requires a base64 encoded key
function AESchiper(myKey) {
	//init
	AES_Init();
	this.chars = base64_chars;
	this.url2bin = url2bin;
	this.keyHash = hash(myKey);
	var aKey = myKey + "B3zwia5bO7y-6vGHu.0rZoMq"; // prime
	this.key = this.url2bin(aKey.substr(0,24)).slice(0,16);
	AES_ExpandKey(this.key);

	//private functions
	this.encrypt = function ( inputStr ) {
		var block = this.string2Bin(inputStr);
		AES_Encrypt(block, this.key);		
		return block;
	}
	
	this.decrypt = function ( array ) {
		var block = array;		
		AES_Decrypt(block, this.key);		
		return this.bin2String(block);
	}
	
	//these functions you want to call
	this.encryptSaltedString = function ( myString, saltedLength ) {
		var len = saltedLength;
		if (len < 1)
			len = myString.length + 2;
		var str = myString.substr(0, len-2).replace('|',''); 
		str += "|" + generateRandomString(len-1-str.length);
		var data=[];
		for(var i=0;i<len;i=i+16){
			data = data.concat( this.encrypt(str.substr(i,16)));
		}
		return this.bin2url( data );
	}
	
	this.decryptSaltedString = function ( myString ) {				
		var arr = this.url2bin( myString );		
		var data='';
		var i, j, len = arr.length;	
		for( i=0;i < len; i=i+16) {
			data+=this.decrypt(arr.slice(i,i+16));			
		}			
		return data.split("|")[0];
	}

	this.encryptSaltedArray = function  ( myArray, saltedLength ) {	
		var result = myArray;
		for(var i = 0;i < result.length;i++) {
			var s = $.trim(result[i]);
			result[i] = this.encryptSaltedString(s, saltedLength);
	  	}
		return result;
	}	
	
	//destructor
	this.finish = function (){
		AES_Done();
		this.key = null;
		this.encrypted = null;
	}

	//some encoding functions
	this.bin2String = bin2String;
	function bin2String(array) {
		var result = "";
		for (var i = 0; i < array.length; i++) {
			result += String.fromCharCode(parseInt(array[i], 2));
		}
		return result;
	}

	this.bin2url = function (input) {
		var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
	    while (i < input.length) {
	    	chr1 = input[i++];
	        chr2 = input[i++];
	        chr3 = input[i++];
	        enc1 = chr1 >> 2;
	        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	        enc4 = chr3 & 63;
	        output += this.chars.charAt(enc1);
	        output += this.chars.charAt(enc2);
	        output += this.chars.charAt(enc3);
	        output += this.chars.charAt(enc4);
	    }
	    return output;
	}
		
	function url2bin(input) {
	    var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
        while (i < input.length) {
            enc1 = this.chars.indexOf(input.charAt(i++));
            enc2 = this.chars.indexOf(input.charAt(i++));
            enc3 = this.chars.indexOf(input.charAt(i++));
            enc4 = this.chars.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output.concat([chr1, chr2, chr3]); 
        }
        return output;
    }

	this.string2Bin=string2Bin;
	function string2Bin(str) {
		var result = [];
		for (var i = 0; i < str.length; i++) {
			result.push(str.charCodeAt(i));
		}
		return result;
	}
	
	function bin2String(array) {
		return String.fromCharCode.apply(String, array);
	}

}

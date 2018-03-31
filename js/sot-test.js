var progressBarInterval;
var baseUrl = "http://52.87.171.80/sample_crud_rest/api/v1/employee";
var message = "";
var searchResponseMsg = ['Checking employees basic information', 'Checking contact details', 'Checking department information', 'preparing Result', 'Rendering Data'];
var deleteResponseMsg = ['Removing employee basic information', 'Removing contact details', 'Removing department information', 'Receiving response from server', 'Updating view'];
var saveResponseMsg = ['Storing employee basic information', 'Storing employee contact details', 'Storing department information', 'Receiving response from server', 'Modifying view to render new employee'];

var validator;

(function() {
  'use strict';
  	// Modified default behaviour of error messages
  	$.validator.setDefaults({
	    highlight: function(element) {
	        $(element).closest('.form-control').addClass('has-error');
	    },
	    unhighlight: function(element) {
	        $(element).closest('.form-control').removeClass('has-error');
	    },
	    errorPlacement: function(error, element) {
	        if(element.parent('.input-group').length) {
	            error.insertAfter(element.parent());
	        } else {
	            error.insertAfter(element);
	        }
	    }
	});
  	//search operation
  	$("#btn-search").click(function() {
	  	$("#tbl-employee tbody").html("");
	  	var queryString = [];
	  	if($("#txt-search-firstName").val()) {
			queryString+= "emp_first_name="+$("#txt-search-firstName").val();
	  	}
	  	if($("#txt-search-lastName").val()) {
	  		queryString+= ",emp_last_name="+$("#txt-search-lastName").val();
	  	}

		var searchPromise = sendApiCall(baseUrl+"?filter="+queryString+"&order=-emp_id",'GET');
	  	//start loading animation
	  	startLoading(searchResponseMsg, function() {
		    searchPromise.then(function(response) {
				if(response.data) {
					//render data
					renderDataInTable(response.data);
					message = "Employee found successfully, Please check below table...";
					showResponse(message, "success");
				} else {
					//show error
					message = "No Employee for " +
							$("#txt-search-firstName").val()+" "+ $("#txt-search-firstName").val() +
	 						" Please try another name ...";

					showResponse(message, "error");

				}
			});
		});
  	});
	// set validator for employee form
  	validator = $("#frm-emp").validate({
  		rules: {
			"txt-frm-username": "required",
			"txt-frm-firstname": "required",
			"txt-frm-lastname": "required",
			"select-frm-gender": "required",
			"txt-frm-phone": {
				required: true,
				number: true,
				minlength: 10
			},
			"txt-frm-email": {
				required: true,
				email: true
			},
			"txt-frm-designation" : {
				required: true
			},
			"select-frm-department": {
				required: true
			}

		}
	});
})();
// Display Employee add form
function showAdd() {
	resetForm();
	$("#frm-emp-modal").modal('show');
}
// Display Edit form
function showEdit(empData) {
	$("#frm-emp-modal").modal('show');
	setEditData(empData);
}
// Save new / updated data.
function saveData() {
	if($("#frm-emp").valid()) {
		$("#frm-emp-modal").modal('hide');
		var empData = getFormData();
		var url = baseUrl;
		var method = "POST";
		if(empData.emp_id) {
			method = "PUT";
			url += "/"+empData.emp_id;
		} else {
			delete empData.emp_id;
		}

		var savePromise = sendApiCall(url, method, empData);
		startLoading(saveResponseMsg, function() {
			savePromise.then(function(response) {
				if(response.data) {
					var tr = generateRow(response.data);
					if(method=="POST") {
						$("#tbl-employee tbody").prepend(tr);
					} else if(method == "PUT") {
						$("#tr-"+empData.emp_id).replaceWith(tr);
					}
					if(method=="POST") {
						message = "Employee data stored successfully";
					} else {
						message = "Employee data updated successfully";
					}
					showResponse(message, "success");
				} else {
					if(method=="POST") {
						message = "Error occured while saving employee data" +
									" Please try after sometime ..";
					} else {
						message = "Employee data is not updated," +
								" Please try after sometime ..";

					}
					showResponse(message, "error");

				}
			});
		});
	}
}
// Delete employee record
function deleteEmployee(empId) {
	var isDelete = confirm("Are you sure you want to delete this employee...");
	if(isDelete) {
		var deletePromise = sendApiCall(baseUrl+"/"+empId,'DELETE');
	  	//start loading animation
	  	startLoading(deleteResponseMsg, function() {
		    deletePromise.then(function(response) {
				if(response.data) {
					$("#tr-"+empId).remove();
					message = "Employee record removed suceessfully...";
					showResponse(message, "success");
				} else {
					message = "Error occured while removing employee data Please try after sometime ...";
					showResponse(message, "error");
				}
			});
		});
	}
}

// Common function to send api calls
function sendApiCall(url, method, data) {
	// Default options are marked with *
	var config = {};
	if (data) {
		config.body = JSON.stringify(data);
	}
	config.method = "GET";
	if (method) {
		config.method = method;
	}
	config.headers = {
              "Content-type" : "application/json"
          };
	return fetch(url, config)
	.then(function(response) {
		if (!response.ok) {
			throw Error(response.message);
		}
		return response.json();
	})
	.catch(function(error) {
		return error;
	})
}
// Loading initiate
function startLoading(msgs, callBack) {
	$("#modal-progress").modal("show");
	$(".progress-bar").html("0%");
	$(".progress-bar").css("width", "0%");
	$(".progress").show(1000);
	$("#msg-response").show(1000);
	resetInterval(Math.floor((Math.random() * 400) + 100), callBack, msgs);
}
// Loading logic to dissplay different messages and
function animateProgressBar(callBack, msgs) {
	var currentPos = $(".progress-bar").html().slice(0,-1);

	if(currentPos == 100) {
		clearInterval(progressBarInterval);
		$("#modal-progress").modal("hide");
		$(".progress").hide(1000);
		$("#msg-response").hide(1000);
		callBack();
	} else if (currentPos ==  20) {
		resetInterval(getRandomInt(100, 500), callBack, msgs);
	} else if (currentPos == 40) {
		resetInterval(getRandomInt(200, 500), callBack, msgs);
	} else if (currentPos == 60) {
		resetInterval(getRandomInt(500, 1000), callBack, msgs);
	} else if (currentPos == 80) {
		resetInterval(getRandomInt(100, 500), callBack, msgs);
	}

	if(currentPos < 100) {
		var increasePos = parseInt(currentPos)+1;
		$(".progress-bar").css("width", increasePos+"%");
		$(".progress-bar").html(increasePos+"%");
	}
}
//reset loading animation
function resetInterval(speed, callBack, msgs) {
	clearInterval(progressBarInterval);
	$("#msg-response").html(msgs[0]);
	msgs = msgs.slice(1);
	progressBarInterval = setInterval(
		function() {
			animateProgressBar(callBack, msgs);
		},
		speed
	);
}
// generate random number
function getRandomInt(min, max) {
	var randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomValue;
}
// render table
function renderDataInTable(data) {
	var tr = "";
	$.each(data, function(i, row) {
		tr += generateRow(row);
	});
	$("#tbl-employee tbody").append(tr);
}
// prepare row
function generateRow(row) {
	return "<tr id=tr-"+row.emp_id+">"+
			"<td scope='col' class='d-none d-md-table-cell'>" +
				row.emp_first_name +" "+ row.emp_last_name +
				"<span class='d-none d-md-block d-lg-none'> ("+ row.emp_gender+")</span>"+
			"</td>"+
			"<td scope='col' class='d-none d-lg-table-cell'>"+ row.emp_gender + "</td>" +
			"<td scope='col' class='d-none d-lg-table-cell'>"+ row.emp_phone + "</td>" +
			"<td scope='col' class='d-none d-lg-table-cell'>"+ row.emp_email + "</td>" +
			"<td scope='col' class='d-none d-lg-table-cell'>"+ row.emp_address + "</td>" +
			"<td scope='col' class='d-table-cell d-md-none col-md-5'>" +
				"<b>Name:</b>" + row.emp_first_name +" "+ row.emp_first_name + "(" + row.emp_gender + ")"+
				"<br> <b>Contact:</b><br>" + row.emp_phone + ", " +
				"<br>" + row.emp_email + ", <br>" + row.emp_address +
				"<br> <b> Department:</b> <br> "+
					row.emp_designation +
				", <span class='d-md-block d-lg-none'>" + normalizeDepartment(row.emp_department) + "</span>"+
			"</td>" +
			"<td scope='col' class='d-none d-md-table-cell d-lg-none'>" +row.emp_phone+","+ row.emp_email +","+ row.emp_address+"</td>"+
			"<td scope='col col-md-2' class='d-none d-md-table-cell'>" +
				row.emp_designation +
				", <span class='d-md-block '> "+normalizeDepartment(row.emp_department)+" </span>"+
			"</td>" +
			"<td scope='col col-md-2' >"+
				"<a herf='javascript:void(0);' onclick='showEdit("+JSON.stringify(row)+")' >"+
					"<i class='fa fa-edit text-info' ></i>"+
				"</a>"+
				"<a herf='javascript:void(0);' onclick='deleteEmployee("+row.emp_id+")' >"+
					"<i class='fa fa-trash-alt text-danger'></i>"+
				"</a>"+
			  "</td>"+
		"</tr>";
}
// Set Data in employee form for edit
function setEditData(empData) {
	$("#txt-frm-id").val(empData.emp_id);
	$("#txt-frm-username").val(empData.emp_username);
	$("#txt-frm-firstname").val(empData.emp_first_name);
	$("#txt-frm-lastname").val(empData.emp_last_name);
	$("#select-frm-gender").val(empData.emp_gender);
	$("#txt-frm-phone").val(empData.emp_phone);
	$("#txt-frm-email").val(empData.emp_email);
	$("#txt-frm-address").val(empData.emp_address);
  	$("#txt-frm-designation").val(empData.emp_designation);
  	$("#select-frm-department").val(empData.emp_department);

}
// Read data from form
function getFormData() {
	var empData = {};
	empData.emp_id = $("#txt-frm-id").val();
	empData.emp_username = $("#txt-frm-username").val();
	empData.emp_first_name = $("#txt-frm-firstname").val();
	empData.emp_last_name = $("#txt-frm-lastname").val();
	empData.emp_gender = $("#select-frm-gender").val();;
	empData.emp_phone = $("#txt-frm-phone").val();
	empData.emp_email = $("#txt-frm-email").val();
	empData.emp_address = $("#txt-frm-address").val();
  	empData.emp_designation = $("#txt-frm-designation").val();
  	empData.emp_department = $("#select-frm-department").val();
  	return empData;
}
// Reset Form and reset validation
function resetForm() {
	$("#txt-frm-id").val("");
	$("#txt-frm-username").val("");
	$("#txt-frm-firstname").val("");
	$("#txt-frm-lastname").val("");
	$("#select-frm-gender").val("");
	$("#txt-frm-phone").val("");
	$("#txt-frm-email").val("");
	$("#txt-frm-address").val("");
  	$("#txt-frm-designation").val("");
  	$("#select-frm-department").val("");
  	validator.resetForm();
  	$("#frm-emp .form-control").removeClass("has-error");
}
// get full name of Department
function normalizeDepartment(department) {
	switch(department) {
		case "SD" : return "Software Development";
		case "BD" : return "Business Development";
		case "HR" : return "Human Resource";
 	}
}
// Show response message
function showResponse(message, type) {
	if(type == "error") {
		$("#api-message").addClass("alert-danger");
	} else {
		$("#api-message").addClass("alert-success");
	}
	$("#api-message").show();

	$("#api-message").html(message);

	setTimeout(function() {
		$("#api-message").hide();
	}, 5000);
}

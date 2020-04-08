(function($) {
	window.SmilesFamilyAccount = {};

    SmilesFamilyAccount.FamilyAccountController = {
	cardRule				: [],
	$familyName				: $('#inputFamilyName'),
	$smlsPassword 			: $('#smlsPassword'),
	$greeTerms 				: $('#termsOfUseCheck'),
	$cpf 					: $('.cpf'),
	$alterFamilyName 		: $('#inputAlterFamilyName'),
	$name 					: $('.name'),
	$email					: $('.email'),
	$divNotSmiles			: $('#divCliNaoSmiles'),
	$btnSubstituirMembro 	: $('.btn-substituir-membro'),
	$btnSendInvite			: $('.btn-send-invite'),
	agentSearch             : /(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i,
	modalEdit				: null,
	$form					: null,
    termsOfUseContent		: null,
	sendInvitationURL		: null,
	updateURL				: null,
	namespace				: null,
	validateCreateFields	: null,
	validateUpdateNmField	: null,
	validateSendInvFields	: null,
	validateCancelFields	: null,
	isNotSmiles				: null,

	init : function() {

		this.maskFields();

		$('[data-toggle="tooltip"]').tooltip();

		$('#voltar').on('click',function() {
			window.location = '/minha-conta';
		});

		$('#clear').on('click',function() {
			SmilesFamilyAccount.FamilyAccountController.$smlsPassword.val('');
		});

		$('#showModalEdit').on('click',function() {
			SmilesFamilyAccount.FamilyAccountController.abrirModalEdit();
		});

		$('#confirm').on('click',function() {
			SmilesFamilyAccount.FamilyAccountController.colorBorder();
			if(SmilesFamilyAccount.FamilyAccountController.checkData()) {
				if($('#'+ SmilesFamilyAccount.FamilyAccountController.namespace+'familyName')) {
					$('#'+ SmilesFamilyAccount.FamilyAccountController.namespace+'familyName').val($('#inputFamilyName').val());
				}
				$('#'+ SmilesFamilyAccount.FamilyAccountController.namespace+'password').val($('#smlsPassword').val());
				$('#alertaModaloadingairplane').modal('show');

				$('#' + SmilesFamilyAccount.FamilyAccountController.namespace + 'familyAccountForm').submit();
			}
		});

		$('#btnCancel').on('click',function() {
			SmilesFamilyAccount.FamilyAccountController.validateCancelFields = true;
			SmilesFamilyAccount.FamilyAccountController.colorBorder();
			if( SmilesFamilyAccount.FamilyAccountController.checkData()) {
				$('#'+SmilesFamilyAccount.FamilyAccountController.namespace+'password').val($('#smlsPassword').val());
				$('#'+SmilesFamilyAccount.FamilyAccountController.namespace+'cancelFamilyAccountForm').submit();
			}
		});

		$('#btnExcluirContaFamilia').bind('click',function() {
			$('#alertaModaloadingairplane').modal('show');
			window.location = '/group/guest/minha-conta/conta-familia/excluir-conta';
		});

		$('#btnAlterarNomeFamilia').on('click',function() {
			let _this = SmilesFamilyAccount.FamilyAccountController;
			_this.validateUpdateNmField = true;
			_this.$familyName= $('#familyName');
			_this.$alterFamilyName = $('#inputAlterFamilyName');
			_this.colorBorder();
			if(_this.checkData()) {
				$('#btnAlterarNomeFamilia').prop('disabled', true);
				_this.updateFamilyName(_this.$alterFamilyName.val());
			}
		});

		$('#confirm-member-replacement').on('click',function() {
			SmilesFamilyAccount.FamilyAccountController.changeMember();
		});

		$('#showModalTermos').on('click', function() {
			SmilesFamilyAccount.FamilyAccountController.abrirModalTermsOfUse();
		});

		if($('#message')) {
			if($('#message').val() !== null && $('#message').val() !== '') {
				const modal = new smiles.portal.commons.Modal($('#errorModal'));
				try {
					modal.setMessageModalError($('#message').val());
					modal.setBehaviorModalError(
						function() {
							return;
						}
					);
				} catch (e) {}
				modal.show();
			}
		}

		var val = function (cb) {
			return $('input#smlsPassword').val(function (_, v) {
				return cb(v);
			}).change();
		};

		$(".number-keyboard .layout > *").click(function () {
			var this$ = this;
			$(this).addClass('active');
			return setTimeout(function () {
				return $(this$).removeClass('active');
			}, 500);
		});

		[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map(function (n) {
			return $('.n' + n).click(function () {
				return val(function (v) {
					if (v.length < 4) {
                        return v + n;
                    } else {
                        return v;
                    }
				});
			});
		});


        this.$smlsPassword.on('keyup', function() {
            $('#smlsPassword').val('');
		});

        this.$smlsPassword.keyup(function() {
		    var max = 4;
		    if ($(this).val().length > max) {
		        $(this).val($(this).val().substr(0, max));
		    }
		});
        
	    $('#btn-info').on('click',function (event){
		   event.preventDefault();
		   const id = event._currentTarget.id;
		   const result = parseInt(id) + parseInt(1);
		   if($('#'+result).css('display') === 'none'){
		      $('#'+ result).css('display','block');
		    }else{
			  $('#'+ result).css('display','none');
		    }
	    });

		this.addListeners();
	},

	maskFields : function maskFields() {

		$('.cpf').mask('999.999.999-99');
	},

	addListeners: function(){
		
		this.$name.on('focus', function(event){
    		let userAgent = navigator.userAgent.toLowerCase();
		    if( userAgent.search(this.agentSearch)!= -1 ) {
		    	$('#smls-modal-convidar').parent().css('top', '0px');
		    	$('#smls-modal-convidar').css('overflow', 'scroll');
		    	$('#smls-modal-convidar').css('height', '315px');
			}
    	});

    	this.$email.on('focus', function(event){
		    var userAgent = navigator.userAgent.toLowerCase();
		    if( userAgent.search(this.agentSearch)!= -1 ) {
		    	$('#smls-modal-convidar').parent().css('top', '0px');
		    	$('#smls-modal-convidar').css('overflow', 'scroll');
		    	$('#smls-modal-convidar').css('height', '315px');
			}
    	});

		$('.cpf').on('blur', function(event){
    		if(!$(this).prop('readonly')) {

        		var cpf = $(this).val().toString().replace(/[^0-9]/g, '');
        		var invitationCode = $('#invitationCode').val();

       			if(SmilesFamilyAccount.FamilyAccountController.checkCPF(cpf)) {
    				smiles.portal.CommomValidators.controller.makeFieldValid('.cpf');
           			$('.check-icon').show();
               		SmilesFamilyAccount.FamilyAccountController.checkMemberInfo(cpf, invitationCode);
               		$('.cpf').prop('readonly', true);
               		$("#btnEnviarConvite").removeAttr("disabled");
       			} else {
       				smiles.portal.CommomValidators.controller.makeFieldInvalid('.cpf');
				}
    		}
    	});

		this.$email.on('blur', function(event){
			var email = $inputEmail.val();

			if(SmilesFamilyAccount.FamilyAccountController.isNotSmiles) {
	    		if(!SmilesFamilyAccount.FamilyAccountController.validateEmail(email)) {
	    			smiles.portal.CommomValidators.controller.makeFieldInvalid(email);
					return false;
	    		} else {
					smiles.portal.CommomValidators.controller.makeFieldValid(email);
					return true;
	    		}
			}
		});

		if($('.btn-cancel')) {
			$('.btn-cancel').on('click',function() {
				SmilesFamilyAccount.FamilyAccountController.validateCancelFields = true;
				SmilesFamilyAccount.FamilyAccountController.colorBorder();
				if( SmilesFamilyAccount.FamilyAccountController.checkData()) {
					$('#'+SmilesFamilyAccount.FamilyAccountController.namespace+'password').val($('#smlsPassword').val());
					$('#'+SmilesFamilyAccount.FamilyAccountController.namespace+'cancelFamilyAccountForm').submit();
				}
			});
		}

		if($('.btn-excluir-conta-familia')) {
			$('.btn-excluir-conta-familia').bind('click',function() {
				$('#alertaModaloadingairplane').modal('show');
				window.location = '/group/guest/minha-conta/conta-familia/excluir-conta';
			});
		}

		if ($('.btn-alterar-nome-familia')) {
			$('.btn-alterar-nome-familia').on('click',function() {
				SmilesFamilyAccount.FamilyAccountController.validateUpdateNmField = true;
				let familyAccountName = $('#inputAlterFamilyName').val();
				SmilesFamilyAccount.FamilyAccountController.colorBorder();
				if(SmilesFamilyAccount.FamilyAccountController.checkData()) {
					$('.btn-alterar-nome-familia').prop('disabled', true);
					SmilesFamilyAccount.FamilyAccountController.updateFamilyName(familyAccountName);
				}
				return;
			});
		}

		if (this.$btnSendInvite ) {
			this.$btnSendInvite.on('click',function() {
				SmilesFamilyAccount.FamilyAccountController.validateSendInvFields = true;

				let cpf;

				cpf = SmilesFamilyAccount.FamilyAccountController.$cpf.val();
				cpf = cpf.toString().replace(/[^0-9]/g, '');

				SmilesFamilyAccount.FamilyAccountController.sendInvitation(cpf, false);
				return;
			});
			this.$btnSendInvite.removeAttr("disabled");
		}

		$('.btn-confirm').on('click',function() {

			SmilesFamilyAccount.FamilyAccountController.changeMember();
			return;
		});

		if($('.btn-send-invite')){

			$('.btn-send-invite').on('click',function() {
				SmilesFamilyAccount.FamilyAccountController.addMemberToAccount();

				return;
			});
			$('.btn-send-invite').removeAttr("disabled");
		}
	},

	addMemberToAccount : function addMemberToAccount() {

		if ($('.cpf').val().length == 14) {

			this.validateSendInvFields = true;
			let cpf = $('.cpf').val().toString().replace(/[^0-9]/g, '');

			this.sendInvitation(cpf,false);
			return;
		} else {
			smiles.portal.CommomValidators.controller.makeFieldInvalid('.cpf');
		}
	},

	sendInvitation : function(_cpf, resend, self) {

		this.$btnSendInvite.prop('disabled', true);

		let jsonRequest = {};


		var cpf = $('#inputCpf').val();
		if(cpf === undefined)
		{
			cpf= _cpf;
		}
		
		cpf = cpf.toString().replace(/[^0-9]/g, '');

		jsonRequest[this.namespace+'inputCpf'] = cpf;
		jsonRequest[this.namespace+'familyAccountId'] = $('#familyAccountId').val();
		if(resend){
			jsonRequest[this.namespace+'inputName'] = $(self).data("name");
			jsonRequest[this.namespace+'inputEmail'] = $(self).data("email");
			jsonRequest[this.namespace+'invitationCode'] = $(self).data("invitationcode");

		}else {
			jsonRequest[this.namespace+'inputName'] = $('#inputName').val();
			jsonRequest[this.namespace+'inputEmail'] = $('#inputEmail').val();
			jsonRequest[this.namespace+'invitationCode'] = $('#invitationCode').val();
		}
		$.ajax({
			url:this.sendInvitationURL,
			method: 'post',
			dataType: 'json',
			data: jsonRequest,
			success: function(data) {

				if (data.status === 'success') {
					let message = '<h4 class ="nunito-light brand-light text-center">'+Liferay.Language.get('message.email.sent.successfull')+'</h4>';
					SmilesFamilyAccount.FamilyAccountController.showMessageAfterSending(message);
					SmilesFamilyAccount.FamilyAccountController.familyAccountPageReload();
				} else if (data.error) {
					SmilesFamilyAccount.FamilyAccountController.showMessageAfterSending(Liferay.Language.get('message.modal.title.send.invitation'), data.error);
				}
			},
			beforeSend: function() {
				$('.close').click();
				$('#alertaModaloadingairplane').modal('show');
			},
			complete: function() {
				$('#alertaModaloadingairplane').modal('hide');
			},
		});
	},

	//CRIA REGRAS (JSON)
	createRules : function() {
		let i=-1;
		if(this.validateCreateFields) {
			this.cardRule[++i] = {'rule': 'inputFamilyName', 'value': this.$familyName.val()  ,'lengthMin':1,'lengthMax':25,'type':'letternumber'};
			this.cardRule[++i] = {'rule':'smlsPassword', 'value': this.$smlsPassword.val() ,'lengthMin':4,'lengthMax':4,'type':'letternumber'};
			this.cardRule[++i] = {'rule':'termsOfUseCheck','value': this.$greeTerms.is(':checked') ,'type':'boolean'};
		}
		if(this.validateUpdateNmField) {
			this.cardRule[++i] = {'rule':'inputAlterFamilyName2','value': $('#inputAlterFamilyName').val()  ,'lengthMin':1,'lengthMax':25,'type':'letternumber'};
		}
		if(this.validateSendInvFields) {
			if(this.$cpf) {
				this.cardRule[++i] = {'rule':'inputCpf', 'value': $('.cpf').val() ,'lengthMin':1,'lengthMax':11,'type':'letternumber'};
			}
			if(this.isNotSmiles) {
				this.cardRule[++i] = {'rule':'inputName', 'value': $('.name').val() ,'lengthMin':1,'lengthMax':75,'type':'letternumber'};
				this.cardRule[++i] = {'rule':'inputEmail', 'value': $('.email').val() ,'lengthMin':1,'lengthMax':75,'type':'letternumber'};
			}
		}
		if(this.validateCancelFields) {
			this.cardRule[++i] = {'rule':'smlsPassword', 'value': this.$smlsPassword.val() ,'lengthMin':4,'lengthMax':4,'type':'letternumber'};
		}
	},
	//APLICACAO DE REGRAS GENERICA
	applicationRule : function(rule) {

		var _cardRule = SmilesFamilyAccount.FamilyAccountController.cardRule;

		let data = _cardRule[rule].value;
		if(!data){
			return false;
		}
		if(_cardRule[rule].type == 'letternumber') {
			data = data.toString().replace(/[^0-9 a-z A-Z]/g, '');
		}
		if(_cardRule[rule].type == 'boolean') {
			return data;
		}
		return data.toString().length >= _cardRule[rule].lengthMin &&
				data.toString().length <= _cardRule[rule].lengthMax;
	},

	applicationCreateRule : function() {
		let getReturn = true;
		$.each(SmilesFamilyAccount.FamilyAccountController.cardRule, function(value, item) {
			if(!(SmilesFamilyAccount.FamilyAccountController.applicationRule(value))) {
				getReturn = false;
			}
			else if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule =='inputFamilyName') {
				if(SmilesFamilyAccount.FamilyAccountController.$familyName !== null && SmilesFamilyAccount.FamilyAccountController.$familyName.val()!=='') {
					smiles.portal.CommomValidators.controller.makeFieldValid(SmilesFamilyAccount.FamilyAccountController.$familyName);
				}
			} else if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule =='termsOfUseCheck') {
				if(SmilesFamilyAccount.FamilyAccountController.$greeTerms !== null && SmilesFamilyAccount.FamilyAccountController.$greeTerms.is(':bed')) {
					$('#createTermsAgreementDiv').removeClass('gree-terms-unchecked');
				}
			} else if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule  == 'smlsPassword') {
				if(SmilesFamilyAccount.FamilyAccountController.$smlsPassword !== null && SmilesFamilyAccount.FamilyAccountController.$smlsPassword.val() !== '') {
					smiles.portal.CommomValidators.controller.makeFieldValid(SmilesFamilyAccount.FamilyAccountController.$smlsPassword);
			} else if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule =='inputAlterFamilyName') {
				if(SmilesFamilyAccount.FamilyAccountController.$alterFamilyName !== null && SmilesFamilyAccount.FamilyAccountController.$alterFamilyName !=='') {
					smiles.portal.CommomValidators.controller.makeFieldValid(SmilesFamilyAccount.FamilyAccountController.$alterFamilyName);
				}
			} else if(SmilesFamilyAccount.FamilyAccountController.$cpf) {
				if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule =='inputCpf') {
					if(SmilesFamilyAccount.FamilyAccountController.$cpf.val() !=='') {
						smiles.portal.CommomValidators.controller.makeFieldValid(SmilesFamilyAccount.FamilyAccountController.$cpf);
					}
				}
			}else if(SmilesFamilyAccount.FamilyAccountController.isNotSmiles) {
					if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule =='inputName') {
						if($('#inputName') !== null && $('#inputName').val() !=='') {
							smiles.portal.CommomValidators.controller.makeFieldValid($('#inputName'));
						}
					} else if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule =='inputEmail') {
						if($('#inputEmail') !== null) {
							if($('#inputEmail').val()!=='' && this.validateEmail($('#inputEmail').val())) {
								smiles.portal.CommomValidators.controller.makeFieldValid($('#inputEmail'));
							}
						}
					}
				} else {
					//Esconde os campo Nome e Email para membro for Smiles
					SmilesFamilyAccount.FamilyAccountController.$divNotSmiles.css('display','none');
				}
			}
		});
		return getReturn;
	},

	validateMember : function() {
		$('#alertaModaloadingairplane').modal('show');
		this.$form.submit();
	},

	loadFamilyAccount : function() {
		$('#alertaModaloadingairplane').modal('show');
		this.$form.submit();
	},

	//VALIDACAO CAMPOS
	checkData : function(){

		this.createRules();
		return this.applicationCreateRule();
	},

	//COLORE A BORDA DE VERMELHO NOS CAMPOS INCOERENTES
	colorBorder : function(){
		this.createRules();
		$.each(SmilesFamilyAccount.FamilyAccountController.cardRule, function(value,item) {
			if(!(SmilesFamilyAccount.FamilyAccountController.applicationRule(value))){
				if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule  == 'inputFamilyName' && $('#inputFamilyName').val() === ''){
					smiles.portal.CommomValidators.controller.makeFieldInvalid(SmilesFamilyAccount.FamilyAccountController.$familyName);
				}
				if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule  == 'termsOfUseCheck' && !SmilesFamilyAccount.FamilyAccountController.$greeTerms.is(':checked')){
					    $('#createTermsAgreementDiv').addClass('gree-terms-unchecked');
					});
						
				}
				if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule  == 'smlsPassword' && SmilesFamilyAccount.FamilyAccountController.$smlsPassword.val()===''){
					smiles.portal.CommomValidators.controller.makeFieldInvalid(SmilesFamilyAccount.FamilyAccountController.$smlsPassword);
				}
				if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule  =='inputCpf') {
					if(document.getElementById('inputCpf') && SmilesFamilyAccount.FamilyAccountController.$cpf.val()==='') {
						smiles.portal.CommomValidators.controller.makeFieldInvalid(SmilesFamilyAccount.FamilyAccountController.$cpf);
					}
				}
				if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule   == 'inputAlterFamilyName' && SmilesFamilyAccount.FamilyAccountController.$alterFamilyName.val()===''){
					smiles.portal.CommomValidators.controller.makeFieldInvalid(SmilesFamilyAccount.FamilyAccountController.$alterFamilyName);
				}
				if(SmilesFamilyAccount.FamilyAccountController.isNotSmiles) {
					if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule  =='inputName' && $('#inputName').val() ==='') {
						smiles.portal.CommomValidators.controller.makeFieldInvalid(SmilesFamilyAccount.FamilyAccountController.$name);
					} else if(SmilesFamilyAccount.FamilyAccountController.cardRule[value].rule   =='inputEmail') {
						if($('#inputEmail').val() ==='' || !SmilesFamilyAccount.FamilyAccountController.validateEmail($('#inputEmail'))) {
							smiles.portal.CommomValidators.controller.makeFieldInvalid($('#inputEmail'));
						}
					}
				}
				}
				
			});
	},

	checkMemberInfo : function(cpf, invitationCode) {

		let jsonRequest = {};
		jsonRequest[this.namespace+'inputCpf'] = cpf;

		$.ajax({
			url : this.checkCpfURL,
			method: 'POST',
			dataType: 'json',
			data: jsonRequest,
			beforeSend: function() {
				$('#colorful-modal, .modal-backdrop').hide();
				$('#alertaModaloadingairplane').modal('show');
			},
			complete: function(data) {

				$('#alertaModaloadingairplane').modal('hide');

				if (data.responseText === 'suspended') {
					SmilesFamilyAccount.FamilyAccountController.showMessageAfterSending(Liferay.Language.get('message.modal.title.send.invitation'), Liferay.Language.get('message.cannot.send.invitation.account.issues.found'));
					$('#colorful-modal .close').click();
				} else if (data.responseText === 'isAlreadyAMember') {
					SmilesFamilyAccount.FamilyAccountController.showMessageAfterSending(Liferay.Language.get('message.cannot.send.invitation.already.member'), Liferay.Language.get('message.modal.title.send.invitation'));
					$('#colorful-modal .close').click();
				} else if (data.responseText === 'isNotSmiles') {
					SmilesFamilyAccount.FamilyAccountController.isNotSmiles = true;
					$('#divCliNaoSmiles').show();
					$("#divCliNaoSmiles").css({'visibility': 'visible'});
					$("#btnSubstituirMembro").removeAttr("disabled");
					$('#colorful-modal, .modal-backdrop').show();
				} else if (data.responseText === 'ok') {
					$("#btnSubstituirMembro").removeAttr("disabled");
					$('#colorful-modal, .modal-backdrop').show();
				} else {
					SmilesFamilyAccount.FamilyAccountController.showErrorModal('promotion.optin.error.message.general.try.again.later');
					$('#colorful-modal .close').click();
				}
			}
		});
    },

	showErrorModal : function showErrorModal(message) {
		try {
			var modal = new smiles.portal.commons.Modal($('#errorModal'));
			modal.setMessageModalError(Liferay.Language.get(message));
			modal.show();
		} catch (e) { console.error(e); }
	},

	changeMember : function() {
		this.validateCanceelFields = true;
		this.colorBorder();
		if(this.checkData()) {
			$('#alertaModaloadingairplane').modal('show');
			$('#confirmFamilyAccountForm').submit();
		}
	},

	confirmChangeMember : function() {
		this.$btnSubstituirMembro.attr("disabled", "disabled");

		if (this.validateInvitationData()) {
			const familyAccountId = $('#familyAccountId').val();
			const vinculationId = $('#familyVinculationId').val();
			const currentMemberNumber = $('#currentMemberNumber').val();
			const currentFirstName = $('#currentFirstName').val();
    		const newCpf = $("#inputCpf").val().toString().replace(/[^0-9]/g, '');

			window.location = '/group/guest/minha-conta/conta-familia/substituir-membro?familyAccountId='+familyAccountId+'&vinculationId='+vinculationId+'&currentMemberNumber='+currentMemberNumber+'&currentFirstName='+currentFirstName+'&newCpf='+newCpf+'&newName='+this.$name.val()+'&newEmail='+this.$email.val();
		} else {
			this.$btnSubstituirMembro.removeAttr("disabled");
		}
	},

	showMessageAfterSending : function(message, title) {
		var $modal = $('#alertModal');
		$modal.find('.modal-header h3').html(title === undefined ? '' : title);
		$modal.find('.modal-body').html(message);
		$($modal).modal('show');
	},

	updateFamilyName : function(name) {
		let getReturn = true;
			let jsonRequest = {};
		    jsonRequest[this.namespace+'inputName'] = name;
			$.ajax({
				url: this.updateURL,
				method: 'post',
				dataType: 'json',
				data: jsonRequest,
			 	success: function(data) {
			 			if(data.status=='success') {
							SmilesFamilyAccount.FamilyAccountController.showMessageAfterSending(Liferay.Language.get('message.edit.family.account.successfull'),'');
							$('#showModalEdit').html('Família '+data.familyName);
							$('#colorful-modal .close').click();
			 			} else if(data.error){
							SmilesFamilyAccount.FamilyAccountController.showMessageAfterSending(Liferay.Language.get('message.modal.title.send.invitation'), data.error);
			 			}
		 			}
				});
		return getReturn;
	},

	familyAccountPageReload : function() {
		window.location = '/group/guest/minha-conta/conta-familia';
	},

	checkCPF : function(cpf){
		cpf = cpf.toString().replace(/[^0-9]/g, '');

		if(!$.fn.validateCPF(cpf)) {
			$('#imgCheck').css('display','none');
			return false;
		} else {
			return true;
		}
	},

	validateInvitationData : function() {

        let isFormValid = true;

        if (this.isNotSmiles) {

        	if($('#inputName').val() === '') {
				smiles.portal.CommomValidators.controller.makeFieldInvalid($('#inputName'));
				isFormValid = false;
			} else {
				smiles.portal.CommomValidators.controller.makeFieldValid($('#inputName'));
			}

        	if(!this.validateEmail($('#inputEmail'))) {
				smiles.portal.CommomValidators.controller.makeFieldInvalid($('#inputEmail'));
               	isFormValid = false;
        	} else {
				smiles.portal.CommomValidators.controller.makeFieldValid($('#inputEmail'));
        	}
        }
        return isFormValid;
	},

	validateEmail : function(email) {
		if(email instanceof jQuery){
			email = email.val();
		}
	    let exclude=/[^@\-\.\w]|^[_@\.\-]|[\._\-]{2}|[@\.]{2}|(@)[^@]*\1/;
	    let check=/@[\w\-]+\./;
	    let checkend=/\.[a-zA-Z]{2,3}$/;
		if ( ( (email.search(exclude) != -1) || (email.search(check)) == -1) || (email.search(checkend) == -1) ) {
			return false;
		}
	    else {
			return true;
		}
	},

	abrirModalConvidar : function(invitationCode, operation, familyVinculationId, firstName, memberNumber) {

		this.clearSendInvitationForm();

		$('#invitationCode').val(invitationCode);
	    $('#familyVinculationId').val(familyVinculationId);
	    $('#currentMemberNumber').val(memberNumber);
	    $('#currentFirstName').val(firstName);

	    var buttonInvite = "<button id='btnEnviarConvite' disabled class='btn btn-primary btn-lg btn-send-invite'>"
	    						+  Liferay.Language.get('label.send.invitation') +"</button>";

	    if(operation == 'change') {
	    	buttonInvite = "<button id='btnSubstituirMembro' class='btn btn-primary btn-lg btn-substituir-membro ' disabled " +
	    			"			onclick='SmilesFamilyAccount.FamilyAccountController.confirmChangeMember();'>"
	    						+ Liferay.Language.get("label.send.invitation")	+"</button>";
	    }

		var modal =
			 "<div id='smls-modal-convidar' class='invate-modal'>"
			+"    <p class='text-center'>"+ Liferay.Language.get('label.type.guest.info') +".</p>"
			+"    <div class='input__animate'>"
			+"        <input id='inputCpf' type='text' class='cpf' tabindex='0' required>"
			+"        <label>CPF</label>"
			+"        <span class='check-icon'></span>"
			+"    </div>"
			+"    <span id='msgInvalidCpf'></span>"
			+"    <div id='divCliNaoSmiles' class='hidden'>"
			+"        <div class='input__animate'>"
			+"            <input id='inputName' type='text' class='name' maxlength='75' tabindex='1'>"
			+"            <label>"+ Liferay.Language.get('label.first.name') +"</label>"
			+"        </div>"
			+"        <div class='input__animate'>"
			+"            <input id='inputEmail' type='text'class='email' maxlength='75' tabindex='2'>"
			+"            <label>"+ Liferay.Language.get('label.placeholder.email') +"</label>"
			+"        </div>"
			+"        <span id='msgInvalidEmail'></span>"
			+"    </div>"
			+ buttonInvite
			+"</div>";

		const modalSettings = {
			width : '650px',
			height: '360px',
			headerBackground : '#FF5A00',
			title : '<h4 class="nunito-light">' + Liferay.Language.get('label.invite.member') + '</h4>',
			content : modal
  		}
		new smiles.portal.ColorfulModal(modalSettings).show();

		this.addListeners();
		this.maskFields();
	},

	clearSendInvitationForm : function() {
		//Configura a situação inicial para os campos do formulário
		$('#inputCpf').removeAttr('readonly');
		$('#inputCpf').val('');
		$('#imgCheck').css('display','none');
		$('#divCliNaoSmiles').css('display','none');
		$('#inputName').val('');
		$('#inputEmail').val('');
		this.$btnSendInvite.prop('disabled', false);
		this.$btnSubstituirMembro .prop('disabled', false);
		smiles.portal.CommomValidators.controller.makeFieldValid($('#inputName'));
		smiles.portal.CommomValidators.controller.makeFieldValid($('#inputEmail'));
	},

	abrirModalMembroConvidado : function() {
	const modalSettings = {
   		width : '650px',
    	headerBackground : '#FF5A00',
    	title : 'Membro Convidado',
    	content :  	+'<div id="smls-modal-membro-convidado">'
					+'	<div class="account-family account-family__modal">'
					+'		<div class="row">'
					+'			<div class="span4">'
					+'				<p class="text-center"></p>'
					+'			</div>'
					+'		</div>'
					+'	</div> '
					+'</div>'
  	}

 	new smiles.portal.ColorfulModal(modalSettings).show();
	this.addListeners();
	},

	abrirModalEdit : function() {
		const modalSettings = {
			width : '450px',
			height: '240px',
			headerBackground : '#FF5A00',
			title : '<h4 class="nunito-light">' + Liferay.Language.get('label.title.edit.family.account') + '</h4>',
			content : '<div class="modal-account-family edit text-center" >'
					+  '    <p>'+Liferay.Language.get('label.subtitle.edit.family.account')+'</p>'
					+  '    <div class="row">'
					+  '    	<input id="inputAlterFamilyName" class="row-fluid bottom-gap" name="inputAlterFamilyName" type="text" maxlength="75">'
					+  '       	<button id="btnAlterarNomeFamilia" class="btn btn-primary btn-alterar-nome-familia">'+Liferay.Language.get('label.payment.family.account.submit')+'</button>'
					+  '    </div>'
					+	'</div>'
  		}
		this.modalEdit = new smiles.portal.ColorfulModal(modalSettings);
		this.modalEdit.show();
		$('.btn-alterar-nome-familia').prop('disabled', false);
		this.addListeners();
	},
	
	
	abrirModalTermsOfUse : function() {
		let $modal = $('#alertModal');
		$modal.find('.modal-header h3').html(Liferay.Language.get('label.terms.use'));
		$modal.find('.modal-body').html(this.termsOfUseContent);
		$modal.modal('show');
	},

	excluirMembro : function(memberNumber, cancelType) {
		$('#alertaModaloadingairplane').modal('show');
		window.location = '/group/guest/minha-conta/conta-familia/excluir-membro?memberNumber='+memberNumber+'&cancelType='+cancelType;
	},

	showLabel: function(button) {
		const index = button.id.substr(button.id.length-1);
		$('#actionName-'+ index).css({
			position : "absolute",
			display  : "block",
			width    : "100px",
			top      : (button.offsetTop - 14) + 'px',
			left     : (button.offsetLeft - 13) + 'px',
		});
	},

	hideLabel: function(button) {
		const index = button.id.substr(button.id.length-1);
		$('#actionName-'+ index).hide();
	}
	
	$("[name='termsOfUseCheck']").click(function(){
		var cont = $("[name='termsOfUseCheck']:checked").length;
	    $("#confirm").prop("disabled",cont ? false : true);
		})
};
})(jQuery);
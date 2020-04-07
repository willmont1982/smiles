<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet_2_0" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="aui" uri="http://liferay.com/tld/aui" %>
<%@ taglib prefix="liferay-portlet" uri="http://liferay.com/tld/portlet" %>
<%@ taglib prefix="liferay-theme" uri="http://liferay.com/tld/theme" %>
<%@ taglib prefix="ui" uri="http://liferay.com/tld/ui" %>
<%@ taglib prefix="util" uri="http://liferay.com/tld/util" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<liferay-theme:defineObjects/>

<portlet:actionURL var="createFamilyAccountUrl">
	<portlet:param name="action" value="create" />
</portlet:actionURL>
<div class="account-family row">
	<div class="account-family__create">
		<aui:form id="familyAccountForm" name="familyAccountForm" method="POST" action="${createFamilyAccountUrl}"  onSubmit="new SmilesWaitingModalManager('grp_loading_modal').showModal();">
			<aui:input type="hidden" value="${elibilityId}" name="eligibilityId" id="eligibilityId" />
			<aui:input type="hidden" value="" name="familyName" id="familyName" />
			<aui:input type="hidden" value="" name="password" id="password" />
		</aui:form>
		<div class="span12">
			<h3><ui:message key="label.family.account" /></h3>
			${desktopContentName}
			${mobileContentName}
		</div> 
		<div class="content">
			<div class="row">
				<div class="span12">
					<h4 class="text-center">
						<ui:message key="label.create.family.account.now" />
					</h4>
				</div>
			</div>
			<div class="container">
				<div class="row row-spacing">
						<div class="span12 input__animate">
							<input type="text" required maxlength="25" name="inputFamilyName" id="inputFamilyName">
							<label><ui:message key="label.name.family" /></label>
						</div> 
					</div>
				<div class="row row-spacing">
					<div class="span12" id="createTermsAgreementDiv">
						<input type="checkbox" data-id="termsOfUseCheck" name="toggle"/>
						<label for="termsOfUseCheck">
							<ui:message key="label.register.agree" /> 
							<a class="btn-link" type="button" id="showModalTermos">
								<ui:message key="label.terms.use" /></a>
							</a>
						</label>
					</div> 
				</div>
				<div class="row row-spacing">
					<div class="span9">
						<h4><ui:message key="PAYMENT.PASSWORD.VIRTUAL.KEYBOARD.PASS" /></h4>
					</div>
					<div class="span3">
						<span class="smiles-logos orange"></span>
					</div>
				</div>
				<div class="row row-spacing">
					<div class="span4">
						<input name="smlsPassword" id="smlsPassword" type="password" maxlength="4" readonly="readonly" placeholder="Senha">
					</div>
				</div>
				<div class="number-keyboard">
					<div class="layout">
						<span><ui:message key="PAYMENT.PASSWORD.VIRTUAL.KEYBOARD" /></span>
						<div class="n1">1</div>
						<div class="n2">2</div>
						<div class="n3">3</div>
						<div class="n4">4</div>
						<div class="n5">5</div>
						<div class="n6">6</div>
						<div class="n7">7</div>
						<div class="n8">8</div>
						<div class="n9">9</div>
						<div class="n0">0</div>
					</div>
				</div>
				<div class="row row-spacing">
					<div class="span6">
						<button id="clear" name="clear" class="btn btn-block btn-outline" ><ui:message key="PAYMENT.CLEAR" /></button>
					</div>
					<div class="span6">
						<button id="confirm" name="confirm" class="btn btn-block btn-primary"><ui:message key="label.payment.family.account.submit" /> </button>
					</div>
				</div>	
			</div>
		</div>
	</div>	
</div>
<!--start modal termos CONTEUDO WEB
<div class="yui3-skin-sam">
  	<div id="smls-modal-render">
    	<div id="smls-modal-show-new">
      		<div id="smls-modal">
        		<div class="row modal-account-family">
                	<h3 class="smls-color-orange smls-sm-title smls-txt-center"><ui:message key="label.terms.use" /></h3><br>
                	${termsOfUseContentName}
          		</div>  
        	</div>
    	</div>
	</div>
</div>--> 
</div>

<input type="hidden" name="message" id="message" value="${error}" />

<script type ="text/javascript"> ==$0
	$("[name='toggle']").click(function(){
	var cont = $("[name='toggle']:checked").length;
    $("#showModalTermos").prop("disabled",cont ? false : true);
	}),
</script>

<script>
$(document).ready(function() {
	
	  SmilesFamilyAccount.FamilyAccountController.termsOfUseContent = '${termsOfUseContentName}';
	  SmilesFamilyAccount.FamilyAccountController.namespace = '<portlet:namespace/>';
	  SmilesFamilyAccount.FamilyAccountController.validateCreateFields = true;
	  SmilesFamilyAccount.FamilyAccountController.init();

});
</script>
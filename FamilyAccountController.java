package br.com.smiles.portlet.controller;

import java.io.IOException;
import java.util.Locale;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.PortletException;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.Years;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.portlet.ModelAndView;
import org.springframework.web.portlet.bind.annotation.ActionMapping;
import org.springframework.web.portlet.bind.annotation.RenderMapping;
import org.springframework.web.portlet.bind.annotation.ResourceMapping;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.model.Role;
import com.liferay.portal.model.User;
import com.liferay.portal.util.PortalUtil;

import br.com.smiles.businessactivity.familyaccount.v1.BusinessError;
import br.com.smiles.ebo.common.v1.MemberStatusType;
import br.com.smiles.helper.PortletUtil;
import br.com.smiles.portlet.service.FamilyAccountService;
import br.com.smiles.portlet.service.MemberService;
import br.com.smiles.portlet.vo.FamilyAccountMemberVO;
import br.com.smiles.portlet.vo.GetFamilyAccountVO;
import br.com.smiles.portlet.vo.MemberVO;
import br.com.smiles.portlet.vo.SendInvitationVO;

@Controller("smiles-my-family-account-portlet")
@RequestMapping("View")
public class FamilyAccountController {

	private static Logger LOGGER = LoggerFactory.getLogger(FamilyAccountController.class);
	
	//Páginas
	public static final String START_PAGE = "/familyAccount/master/view";
	public static final String MASTER_FAMILY_ACCOUNT_PAGE = "/familyAccount/master/familyAccount";
	public static final String DEPENDENT_FAMILY_ACCOUNT_PAGE = "/familyAccount/dependent/familyAccount";
	public static final String ERROR_PAGE = "/familyAccount/error/error";
	public static final String FAMILY_ACCOUNT_CONTENTS_PAGE = "/group/guest/minha-conta/conta-familia/sobre";
	public static final String FAMILY_ACCOUNT_INVITATION_PAGE = "/group/guest/minha-conta/conta-familia/adesao-familia";
	public static final String FAMILY_ACCOUNT_INACTIVE_MEMBER_PAGE = "/group/guest/minha-conta/conta-familia/membro-inativo";
	//Constantes
	public static final String MEMBER = "MEMBER";
	public static final String DEPENDENT = "DEPENDENT";
	public static final String IS_ALREADY_A_MEMBER = "isAlreadyAMember"; 
	public static final String IS_SUSPENDED = "suspended";
	public static final String IS_OK = "ok"; 
	public static final String IS_NOT_SMILES = "isNotSmiles"; 
	public static final String IS_IRREGULAR = "irregular";
	
	public static final String CF_ERRO_VINCULOS_OU_CONVITES_NAO_ENCONTRADOS		= "170";
	public static final String CF_ERRO_USUARIO_NAO_CADASTRADONASMILES			= "3";
	public static final String CF_ERRO_NAO_FOI_POSSIVEL_OBTER_TOTAL_TRANSFERIDO	= "188";
	
	@Autowired
	private FamilyAccountService familyAccountService;
	
	@Autowired
	private MemberService memberService;  
	
	@RenderMapping
	public ModelAndView handleRenderRequest(RenderRequest request, RenderResponse response) {
	
		ModelAndView mv = new ModelAndView();
		mv.setView(START_PAGE);
		
		return mv;
	}
	
	@ActionMapping(params = "action=loadFamilyAccount")
	public void loadFamilyAccount(ActionRequest request, ActionResponse response) throws IOException {

		try {
			String memberNumber = PortletUtil.getMemberNumber(request);
			
			GetFamilyAccountVO vo = familyAccountService.getFamilyAccount(memberNumber);

			if(vo.getMemberNumber().equals(memberNumber)) {
				
				if(FamilyAccountService.STATUS_INACTIVE.equals(vo.getStatus())) {
					response.sendRedirect(FAMILY_ACCOUNT_INACTIVE_MEMBER_PAGE);
				} else {
					
					if (vo.getFamilyAccountId() == null || vo.getFamilyAccountId().isEmpty()) {
						response.sendRedirect(FAMILY_ACCOUNT_CONTENTS_PAGE);						
					} else {
						// Master
						request.setAttribute("vo", vo);
						request.setAttribute("changeMemberEligible", this.verifyEligibilityToChangeMember(vo));
						response.setRenderParameter("action", "redirectToMasterFamilyAccountPage");						
					}
				}
				
			} else 
			if(vo.getMemberList() != null && vo.getMemberList().size() > 0) {

				if(FamilyAccountService.TYPE_INVITATION.equals(vo.getMemberList().get(0).getType()) 
						&& FamilyAccountService.STATUS_PENDING.equals(vo.getMemberList().get(0).getStatus())) {
					//Não vinculado - Não aceitou o convite 
					// Redirecionar para a página conta família - Criar Conta Família
					response.sendRedirect(FAMILY_ACCOUNT_INVITATION_PAGE);
					
				} else if((FamilyAccountService.TYPE_MEMBER.equals(vo.getMemberList().get(0).getType()) 
						&& FamilyAccountService.STATUS_ACTIVE.equals(vo.getMemberList().get(0).getStatus())) || (FamilyAccountService.TYPE_MEMBER.equals(vo.getMemberList().get(1).getType()) 
								&& FamilyAccountService.STATUS_ACTIVE.equals(vo.getMemberList().get(1).getStatus()))) {
					
					//Vinculado - Redirecionar para a página do convidado
					String[] args = {vo.getMemberFirstName(), vo.getMemberLastName(), vo.getName()};
					request.setAttribute("args", args);
					request.setAttribute("vo", vo);
					request.setAttribute("jsp", DEPENDENT_FAMILY_ACCOUNT_PAGE);
					// Recuperar o valor total de milhas transferidas entre o vinculado o master;
					request.setAttribute("totalTransferred", familyAccountService.getTotalTransferred(vo.getFamilyAccountId(), memberNumber));
					
					response.setRenderParameter("action", "redirectToDependentFamilyAccountPage");
					
				} else {
					response.sendRedirect(FAMILY_ACCOUNT_CONTENTS_PAGE);
				}
			} else {
				response.sendRedirect(FAMILY_ACCOUNT_CONTENTS_PAGE);
			}
			
		} catch (BusinessError e) {
			
			LOGGER.error("ERROR: Erro ao verificar ao recuperar os dados da conta família.", e);
			String errorCode = e.getFaultInfo().getErrorCode();
			if(!isUserLoggedAdm(PortalUtil.getHttpServletRequest(request))) {
				if(CF_ERRO_VINCULOS_OU_CONVITES_NAO_ENCONTRADOS.equals(errorCode)) {
					// Redirecionar para a página conta família - Criar Conta Família
					response.sendRedirect(FAMILY_ACCOUNT_CONTENTS_PAGE);
				} else if(CF_ERRO_NAO_FOI_POSSIVEL_OBTER_TOTAL_TRANSFERIDO.equals(errorCode)) {
					//Redirecionar para a página do vinculado se ocorrer o errorCode: 188 - Não foi possível obter o total transferido
					request.setAttribute("totalTransferred", null);
					response.setRenderParameter("action", "redirectToDependentFamilyAccountPage");
				} else {
					//
					request.setAttribute("error", e.getFaultInfo().getMessage());
					response.setRenderParameter("action", "redirectToErrorPage");
				}
			}
		} catch (br.com.smiles.services.member.v1.BusinessError e) {
			// Redirecionar para a página conta família - Criar Conta Família
			
			response.sendRedirect(FAMILY_ACCOUNT_CONTENTS_PAGE);
		} catch (Exception e) {
			LOGGER.error("ERROR: Erro ao verificar ao recuperar os dados da conta família.", e);
            final Locale locale = PortalUtil.getLocale(request);
            request.setAttribute("error", LanguageUtil.get(locale, "promotion.optin.error.message.general.try.again.later"));
            response.setRenderParameter("action", "redirectToErrorPage");
		}
	}

	private boolean verifyEligibilityToChangeMember(GetFamilyAccountVO vo) {
		
		boolean flgEligible = false;
		
		if(vo.getMemberList() != null && vo.getMemberList().size() > 0) {
			for (FamilyAccountMemberVO memberVO : vo.getMemberList()) {
				if(FamilyAccountService.TYPE_INVITATION.equals(memberVO.getType()) 
						&& FamilyAccountService.STATUS_AVAILABLE.equals(memberVO.getStatus())) {
					return false;
				}
				if(FamilyAccountService.TYPE_MEMBER.equals(memberVO.getType()) 
				&& FamilyAccountService.STATUS_ACTIVE.equals(memberVO.getStatus())) {
					int years = Years.yearsBetween(memberVO.getAcceptedDate(), DateTime.now()).getYears();
					if(years >= 1) {
						memberVO.setShowChangeMemberLink(true);
						flgEligible = true;
					}
				}
			}
		}
		
		return flgEligible;
	}
	
	@RenderMapping(params={"action=redirectToMasterFamilyAccountPage"})
	public String redirectToMasterFamilyAccountPage(RenderRequest request, RenderResponse response){
		return MASTER_FAMILY_ACCOUNT_PAGE;
	}
	
	@RenderMapping(params={"action=redirectToDependentFamilyAccountPage"})
	public String redirectToDependentFamilyAccountPage(RenderRequest request, RenderResponse response){
		return DEPENDENT_FAMILY_ACCOUNT_PAGE;
	}
	
	@RenderMapping(params={"action=redirectToErrorPage"})
	public String redirectToErrorPage(RenderRequest request, RenderResponse response){
		return ERROR_PAGE;
	}
	
	@ResourceMapping(value="checkCpf")
	public void checkCPF(ResourceRequest request, ResourceResponse response) throws IOException,PortletException {

		String cpf = ParamUtil.get(request, "inputCpf", "");
		
		try{
			MemberVO memberVO = memberService.getMemberNumber(cpf);
			
			if(memberVO != null) {
				
				if(memberVO.getStatus().toString().equals(MemberStatusType.SUSPENDED.value()) || memberVO.getStatus().toString().equals(MemberStatusType.PVSM_SUSPENDED.value())) {
                    response.getWriter().write(IS_SUSPENDED);
                } else {
                    GetFamilyAccountVO vo = familyAccountService.getFamilyAccount(memberVO.getMemberNumber());
                    boolean isAlreadyAMember = vo != null && vo.getFamilyAccountId() != null && !vo.getFamilyAccountId().isEmpty();
                    
                    if(isAlreadyAMember) {
                        response.getWriter().write(IS_ALREADY_A_MEMBER);
                    }
                }
			}
			
		} catch (br.com.smiles.services.member.v1.BusinessError e) {

			LOGGER.error("erro ao realizar a chamada MemberV1.GetMember" + e.getMessage(), e);
			
			if (e.getMessage().contains("o tem conta fam")) {
				
				response.getWriter().write(IS_OK);
				
			}  else if (e.getMessage().contains("o encontrado!")) {
				response.getWriter().write(IS_NOT_SMILES);
		
			}  else {
				
				String errorCode = e.getFaultInfo().getErrorCode();
				
				if(CF_ERRO_USUARIO_NAO_CADASTRADONASMILES.equals(errorCode)) {
					response.getWriter().write(IS_NOT_SMILES);
				} else {
					response.getWriter().write(String.format("{\"error\": \"%s\"}", e.getMessage()));				
				}
			}

		} catch (BusinessError e) {
			
			LOGGER.error("ERROR: Erro ao verificar ao recuperar os dados da conta família.", e);
			response.getWriter().write(String.format("{\"error\": \"%s\"}", e.getMessage()));

		}
	}	

	@ResourceMapping(value="sendInvitation")
	public void sendInvitation(ResourceRequest request, ResourceResponse response) throws IOException,PortletException {
		
		JSONObject jsonObj = JSONFactoryUtil.createJSONObject();
		String memberNumber = PortletUtil.getMemberNumber(request);
		String familyAccountId = ParamUtil.get(request, "familyAccountId", "");
		String invitationCode = ParamUtil.get(request, "invitationCode", "");
		String cpf = ParamUtil.get(request, "inputCpf", "");
		String name = ParamUtil.get(request, "inputName", "");
		String email = ParamUtil.get(request, "inputEmail", "");
		
		try {
			
			SendInvitationVO sendInvitationVO = new SendInvitationVO();
			sendInvitationVO.setFamilyAccountId(familyAccountId);
			sendInvitationVO.setInvitationCode(invitationCode);
			sendInvitationVO.setInvitedDocumentNumber(cpf);
			sendInvitationVO.setMemberNumber(memberNumber);
			
			if(name.isEmpty() || name.equals("undefined") || email.isEmpty() || email.equals("undefined")) {
				MemberVO memberVO = memberService.getMemberNumber(cpf);
				name = memberVO.getFirstName();
				email = memberVO.getContact().getEmail();
			}

			sendInvitationVO.setInvitedName(name);
			sendInvitationVO.setInviteEmail(email);

			familyAccountService.sendInvitation(sendInvitationVO);
			jsonObj.put("status", "success");
			
		} catch (BusinessError e) {
			LOGGER.error("ERROR: Erro ao enviar o convite do conta família.", e);
			jsonObj.put("error", e.getFaultInfo().getMessage());
		} catch (br.com.smiles.services.member.v1.BusinessError e) {
			LOGGER.error("erro ao realizar a chamada MemberV1.GetMember" + e.getMessage(), e);
			jsonObj.put("error", e.getMessage());
		}
		
		response.getWriter().write(jsonObj.toString());
	}
	
	@ResourceMapping(value="update")
	public void update(ResourceRequest request, ResourceResponse response) throws IOException,PortletException {
		
		JSONObject jsonObj = JSONFactoryUtil.createJSONObject();
		String name = ParamUtil.get(request, "inputName", "");
		String memberNumber = PortletUtil.getMemberNumber(request);
		
		try {	
			GetFamilyAccountVO vo = familyAccountService.getFamilyAccount(memberNumber);
			
			familyAccountService.update(vo.getFamilyAccountId(), memberNumber, name);
			jsonObj.put("status", "success");
			
			vo = familyAccountService.getFamilyAccount(memberNumber);
			jsonObj.put("familyName", vo.getName());
			
		} catch (BusinessError e) {
			LOGGER.error("ERROR: Erro ao verificar ao atualizar o nome da conta família.", e);
			jsonObj.put("error", e.getMessage());
		} catch (br.com.smiles.services.member.v1.BusinessError e) {
			LOGGER.error("ERROR: Erro relacionado ao member, ao atualizar o nome da conta família.", e);
			jsonObj.put("error", e.getMessage());
		}
		
		response.getWriter().write(jsonObj.toString());
	}
	
	/**
     * Check if there is a User Logged in and if the user are Admin
     *
     * @param request
     * @return
     */
    private boolean isUserLoggedAdm(ServletRequest request) {
        boolean isAdm = false;
        try {
            User user = PortalUtil.getUser((HttpServletRequest) request);
            
            if (user != null) {
                for (Role role : user.getRoles()) {
                    if ("Administrator".equals(role.getName())) {
                        isAdm = true;
                                               break;
                    }
                }
            }

        } catch (PortalException | SystemException e1) {
            LOGGER.error("Nao foi possivel verificar se usuario e Admin Liferay", e1);
        }
        
        return isAdm;
    }
}
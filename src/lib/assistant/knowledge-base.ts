/**
 * FindAfriq public FAQ, verbatim from "FindAfriq AI Chatbot — Master FAQ &
 * Knowledge Base" v1.0 (sections 1-24, Q1-Q148).
 *
 * Sections 25-34 of that document are *instructions to the bot*, not user-facing
 * facts, so they live in `system-prompt.ts` instead — keeping them out of here
 * stops the assistant quoting its own rulebook back at a user.
 *
 * ~5.5K tokens, which is why this ships whole in a cached system prompt rather
 * than behind a retrieval step. See docs/assistant.md.
 *
 * To update: edit this file directly. It is the source of truth at runtime.
 */
export const KNOWLEDGE_BASE = `## 1. ABOUT FINDAFRIQ

### Q1. What is FindAfriq? FindAfriq is a digital real estate and services platform that connects Seekers with verified properties and trusted service providers . Users can discover properties, find service providers, communicate with listing owners or providers, and access other marketplace features.

### Q2. What does FindAfriq do? FindAfriq helps people:
- Find properties
- Find trusted service providers
- Connect with property owners and agents
- Connect with service providers
- Post properties
- Post services
- Buy and sell selected items and properties
- Communicate through the platform
- Discover verified listings and providers

### Q3. What does "Find Verified Properties and Trusted Service Providers" mean? It means FindAfriq focuses on helping users discover properties and service providers that have gone through applicable verification or review processes.

### Q4. Is FindAfriq a real estate company? FindAfriq is primarily a digital platform and marketplace connecting property seekers with property owners, agents, agencies, and service providers. It is not necessarily the owner, landlord, seller, agent, or service provider behind every listing.

### Q5. Where does FindAfriq operate? FindAfriq is expanding its operations across African markets. The platform operates in Rwanda, beginning with Kigali.

### Q6. Is FindAfriq available in Rwanda? Yes. FindAfriq is in Rwanda, with the initial market focus on Kigali.

### Q7. Why should I use FindAfriq? FindAfriq is designed to make it easier to discover properties and services while improving trust, accessibility, and connection between Seekers and providers.

## 2. USER TYPES

### Q9. Who can use FindAfriq? FindAfriq supports several types of users:
- Seeker — someone looking for a property or service.
- Landlord/Property Owner — someone who owns or manages a property.
- Agent — someone authorized to market properties.
- Real Estate Agency — a professional real estate business .
- Service Provider — a person or business offering household services.
- Seller — someone listing items or properties for sale.

### Q10. What is a Seeker? A Seeker is a person using FindAfriq to search for a property, service, or other available listing.

### Q11. What is a Landlord? A Landlord is a property owner or person responsible for offering a property for rent or sale.

### Q12. What is a Real Estate Agent? A Real Estate Agent is a person who represents or markets properties on behalf of property owners or agencies.

### Q13. What is a Real Estate Agency? A Real Estate Agency is a registered or professional real estate business that markets or manages properties.

### Q14. What is a Service Provider? A Service Provider is an individual or business offering household services through FindAfriq.

### Q15. Can one person have different roles? The available roles depend on FindAfriq's account structure. Users should select the role that accurately represents how they intend to use the platform.

## 3. ACCOUNT REGISTRATION

### Q16. Do I need an account to use FindAfriq? Some features may be publicly accessible, but an account may be required for actions such as contacting users, posting listings, saving listings, messaging, or other protected functions.

### Q17. How do I create a FindAfriq account? Go to the FindAfriq platform and select Sign Up/Register . Enter the required information and complete the registration process.

### Q18. What information do I need to register? Depending on the account type, you may be asked for:
- Select User Type
- Full name
- Email address
- Phone number
- Password
- User type Additional information may be required for verification.

### Q19. I cannot register. What should I do? Check that: 1. Your internet connection is working. 2. Your information is entered correctly. 3. Your email or phone number has not already been registered. 4. You are using the latest version of your browser. If the problem continues, contact FindAfriq support.

### Q20. I forgot my password. What should I do? Use the Forgot Password option on the login page and follow the instructions to reset your password.

### Q21. Can I change my account information? Users should be able to update available profile information through their account settings. Some information may require administrator assistance.

### Q22. Can I delete my account? If account deletion is available, use the account settings or contact FindAfriq support for assistance.

## 4. FINDING A PROPERTY

### Q23. What types of properties can I find on FindAfriq? Depending on the market, FindAfriq may include:
- Apartments
- Houses
- Land
- Office spaces
- Other property categories

### Q24. How do I search for a property? Use the FindAfriq search function and enter or select relevant information such as:
- Location
- Property type
- Price
- Number of bedrooms
- Other available filters

### Q25. Can I search by location? Yes. Users can search for properties based on available locations and geographic information.

### Q26. Can I search by price? Yes, where the price filter is available.

### Q27. Can I search for apartments? Yes. Apartments can be listed under the applicable property category.

### Q28. Can I search for houses? Yes.

### Q29. Can I search for office spaces? Yes, where office spaces are available in the selected market.

### Q30. Can I search for land? Yes, where land listings are available.

### Q31. Can I see property photos? Yes. Property listings can include photos uploaded by the listing owner, agent, or agency.

### Q32. How many photos should a property listing have? Property owners and agents should provide clear and relevant property photos of 10 Max. FindAfriq may establish a minimum photo requirement for specific listing types.

### Q33. Can I contact the person who posted the property? Yes. Where contact functionality is available, users can communicate with the listing owner, agent, or agency through FindAfriq's available contact options.

## 5. PROPERTY VERIFICATION

### Q34. What does "Verified Property" mean? A verified property is a listing that has gone through FindAfriq's applicable verification or review process.

### Q35. Does verification guarantee that a property is legitimate? Verification is intended to increase trust, but users should still conduct appropriate due diligence before making payments, signing agreements, or entering into transactions.

### Q36. Does FindAfriq own the properties listed? No. Properties are generally listed by property owners, landlords, agents, or real estate agencies.

### Q37. Can I trust every property on FindAfriq? FindAfriq works to improve trust through verification and platform controls. However, users should independently verify important details before entering a transaction.

### Q38. What should I check before renting or buying? Users should verify:
- Property location
- Ownership or authority to rent/sell
- Property condition
- Applicable documents
- Price
- Terms and conditions
- Identity of the person offering the property Never send money solely because a listing appears online.

## 6. PROPERTY OWNERS & LANDLORDS

### Q39. Can I list my property on FindAfriq? Yes, eligible users can create property listings.

### Q40. How do I post a property? Log into your FindAfriq account, go to “my listing”, select the option to create a listing, choose the property category, complete the required information, upload photos, and submit the listing.

### Q41. What information should I include? Provide accurate information such as:
- Property title
- Property type
- Location
- Price
- Number of bedrooms
- Description
- Amenities
- Photos
- Contact information
- Other required property details

### Q42. Can landlords post properties? Yes, eligible landlords/property owners can post properties.

### Q43. Can agents post properties? Yes, verified/approved agents can post properties according to FindAfriq's rules.

### Q44. Can real estate agencies post properties? Yes, eligible real estate agencies can list properties.

### Q45. Can I post someone else's property? Only if you have the appropriate permission or authority to market the property.

### Q46. Can I use another person's property photos? No. Do not use images that you do not have permission to use.

### Q47. Why was my listing rejected? A listing may be rejected if:
- Information is incomplete
- Information appears inaccurate
- Photos violate requirements
- The listing violates FindAfriq rules
- Verification requirements were not satisfied
- The property cannot be adequately verified
- The content is inappropriate or misleading

### Q48. Can I edit my listing? Yes, you can edit your listing from your dashboard. Some changes may require review.

## 7. AGENTS

### Q49. How do I become a FindAfriq Agent? Sign up as an Agent and submit the required information. FindAfriq will review your application.

### Q50. Is becoming an agent automatic? Yes.

### Q51. What information is required to become an agent? The application may request:
- Name
- Email
- Location
- WhatsApp/phone number
- Gender
- Other information required for verification

### Q52. Do agents need to be verified? Yes. FindAfriq may require verification before an agent receives full posting privileges.

### Q53. Can agents post properties from Facebook? Agents may repost properties they are authorized to market, provided they follow FindAfriq's posting rules and have permission to use the relevant information and images.

### Q54. Can an agent post a property without permission? No.

### Q55. Do agents need to upload a profile photo? FindAfriq may require agents to provide a clear headshot/profile image.

### Q56. Can an agent charge an agent fee? Where applicable, agent fees should be clearly disclosed to the Seeker and comply with FindAfriq's applicable policies and local requirements.

## 8. SERVICE PROVIDERS

### Q57. What is a FindAfriq Service Provider? A Service Provider is a person or business offering household services that customers can discover through FindAfriq.

### Q58. What services can be listed? Examples include:
- Catering
- Construction
- Cleaning
- Laundry
- Plumbing
- Electrical services
- Painting
- Moving
- Interior design
- Maintenance
- Other approved services

### Q59. How do I register as a service provider? Create a FindAfriq account, select the applicable service-provider option, provide the required information, upload required documentation, and submit your profile for review.

### Q60. Do service providers need verification? Yes, applicable service providers may need to complete verification before receiving verified status.

### Q61. What documents may be required? Depending on the market and business type, FindAfriq may request:
- National ID
- Valid business registration certificate
- Other verification documents

### Q62. Why do you require business registration? Business registration helps FindAfriq establish the identity and legitimacy of eligible businesses.

### Q63. How many photos should a service provider upload? Service providers should upload clear images that demonstrate their services. FindAfriq may require a minimum number of images for service listings.

### Q64. Can an individual offer services without business registration? Eligibility depends on the service category and applicable FindAfriq requirements. Some services may be available to individuals, while businesses may require registration documents.

## 9. CONTACTING USERS & MESSAGING

### Q65. How do I contact a property owner or agent? Open the relevant listing and use the available contact or messaging options.

### Q66. Can I contact someone through WhatsApp? Where WhatsApp contact is enabled, users can connect through WhatsApp after meeting any required account/sign-in conditions.

### Q67. Why do I need to sign in before contacting someone? Sign-in helps FindAfriq protect users, reduce abuse, maintain accountability, and provide a safer communication environment.

### Q68. Can I message a service provider? Yes, where messaging is available for the listing.

### Q69. What should I do if someone sends me suspicious messages? Do not send money or sensitive information. Report the user/listing to FindAfriq.

## 10. BOOKINGS

### Q70. Can I book a service through FindAfriq? Where booking functionality is available for a particular service, users may submit a booking/request through the platform.

### Q71. Who receives a booking? Bookings should be routed to the relevant service provider according to the platform's booking workflow.

### Q72. What happens after I submit a booking? The service provider should receive the request and respond according to their availability and service terms.

### Q73. My booking is not working. What should I do? Check your internet connection and try again. If the problem continues, report the issue to FindAfriq support with:
- Your account information
- Service/listing name
- Date/time of the attempted booking
- Screenshot if available

## 11. BUY & SELL

### Q74. What is FindAfriq Buy & Sell? Buy & Sell is a marketplace feature designed to allow users to list items and properties for sale and connect with potential buyers.

### Q75. What can I sell? Depending on the market and approved categories, users may list:
- Land
- Houses
- Other properties
- Furniture
- Appliances
- Electronics
- Fairly used household items

### Q76. Can I buy something directly through FindAfriq? The initial Buy & Sell model is primarily designed for listing and lead generation . Online payments may be introduced later.

### Q77. Does FindAfriq receive payment for Buy & Sell transactions? Users should follow the current payment and transaction instructions shown on the platform. FindAfriq should not be assumed to hold or guarantee payment unless the platform explicitly provides that service.

### Q78. How do I list an item for sale? Go to your dashboard and select the option to create a Buy & Sell listing, then choose the applicable category and provide the required details.

### Q79. Can I sell land on FindAfriq? Yes, where land listings are supported in the applicable market.

### Q80. Can I sell a house? Yes, where the feature is available.

### Q81. Can I sell used household items? Yes, where the applicable category is available.

## 12. PAYMENTS & FEES

### Q82. Does FindAfriq charge users? Fees depend on the specific FindAfriq product, service, market, and current pricing policy.

### Q83. Does it cost money to create an account? No. Account registration may be free unless FindAfriq explicitly states otherwise.

### Q84. Does FindAfriq charge agents? Agent-related fees, if applicable, depend on FindAfriq's current pricing and agent policies.

### Q85. Does FindAfriq charge service providers? Service-provider fees depend on the applicable FindAfriq pricing model and current policy.

### Q86. Can I pay through FindAfriq? Payment availability depends on the specific feature and market. Follow the payment instructions displayed on the platform.

### Q87. What payment methods are supported? Payment methods vary by country and platform feature. The chatbot should provide only payment methods currently enabled for the user's market. AI RULE: Never invent a payment method, fee, exchange rate, or transaction charge.

### Q88. What currency does FindAfriq use? Currency depends on the market. For Rwanda, prices may be displayed in Rwandan Francs (RWF) . For Liberia, prices may be displayed in United States Dollars (USD) where applicable.

## 13. SAFETY & SCAM PREVENTION

### Q89. How can I avoid scams? Always:
- Verify the person you are dealing with.
- Inspect the property/service where appropriate.
- Confirm important documents.
- Never send money based solely on an online listing.
- Be cautious of unusually low prices.
- Do not share passwords or OTP codes.
- Report suspicious listings.

### Q90. FindAfriq asked me to send money to a personal account. What should I do? Do not make the payment until you confirm that the request is an official FindAfriq transaction. Contact FindAfriq support if you are unsure.

### Q91. Someone is pretending to be a FindAfriq employee. What should I do? Do not share passwords, OTPs, financial information, or other sensitive information. Report the person to FindAfriq through official support channels.

### Q92. I think the listing is fraudulent. What should I do? Report the listing immediately and provide as much information as possible.

### Q93. What if a property owner asks me to pay before viewing the property? Exercise caution. Do not send money solely to secure a viewing or property unless you have independently verified the arrangement and it is a legitimate transaction.

## 14. REPORTING & COMPLAINTS

### Q94. How do I report a listing? Use the available report function on the platform or contact FindAfriq support.

### Q95. How do I report a user? Use the available reporting mechanism or contact support.

### Q96. How do I report a scam? Contact FindAfriq support immediately and provide:
- Listing information
- User information
- Screenshots
- Communication evidence
- Payment information, if applicable

### Q97. What happens after I report something? FindAfriq may review the report, investigate the listing/user, and take appropriate action according to its policies.

### Q98. Can FindAfriq remove a listing? Yes. FindAfriq may remove or restrict listings that violate its rules, contain misleading information, or present other concerns.

## 15. TECHNICAL SUPPORT

### Q99. The platform is not loading. What should I do? Try: 1. Refreshing the page. 2. Checking your internet connection. 3. Clearing your browser cache. 4. Trying another browser. 5. Trying again later. If the problem continues, contact support.

### Q100. The platform is not displaying properly on my laptop. Try refreshing the page and using a current browser. If the issue continues, send FindAfriq support:
- Device type
- Browser
- Screenshot
- Page where the problem occurred

### Q101. The mobile website is not working properly. Ensure you are using an updated browser and a stable internet connection. If the issue continues, report it to FindAfriq.

### Q102. My image will not upload. Check:
- Internet connection
- File size
- File format
- Number of images
- Whether the image meets FindAfriq's requirements Then try again.

### Q103. My listing is stuck loading. Refresh the page and try again. If the problem persists, contact support and provide the listing details and screenshot.

### Q104. The map is showing the wrong location. Report the listing and provide the correct location information. FindAfriq may need to review the listing's location data.

### Q105. I cannot see my listing. Your listing may still be under review, rejected, unpublished, or affected by a technical issue. Check your dashboard first.

## 16. VERIFICATION

### Q106. Why does FindAfriq verify users? Verification helps improve trust and reduce fraudulent or misleading activity.

### Q107. What is required for verification? Requirements depend on the account type and market.

### Q108. How long does verification take? Verification time can vary depending on the information submitted and the volume of applications. AI RULE: Do not promise a specific verification time unless FindAfriq has established an official SLA.

### Q109. Why was my verification rejected? Possible reasons include:
- Invalid document
- Expired document
- Information mismatch
- Incomplete submission
- Unclear document
- Failure to satisfy verification requirements

### Q110. Can I resubmit my verification? If resubmission is enabled, correct the issue identified and submit the required information again.

## 17. FINDING SERVICE PROVIDERS

### Q111. How do I find a service provider? Search FindAfriq by service category and location.

### Q112. What services are available? Availability depends on the market and providers registered on FindAfriq.

### Q113. Can I find a cleaner? Yes, if cleaning providers are available in your area.

### Q114. Can I find a construction company? Yes, where construction providers are listed.

### Q115. Can I find laundry services? Yes, where laundry providers are available.

### Q116. Can I find catering services? Yes, where catering providers are available.

### Q117. How do I know whether a service provider is verified? Look for the applicable FindAfriq Verified status or badge.

## 18. SERVICE REQUESTS

### Q118. Can I request a service? Where service requests or bookings are available, users can contact or request services from listed providers.

### Q119. Can I compare service providers? Users can review available provider information, services, locations, photos, verification status, and other listing information before choosing a provider.

### Q120. Can I review a service provider? If reviews/ratings are enabled for the relevant feature, users may submit reviews based on their experience.

### Q121. What should I do if a service provider does not show up? Contact the provider first through the available communication channel. If there is a platform-related booking issue, contact FindAfriq support.

## 19. FAVORITES / SAVED LISTINGS

### Q122. Can I save a property? If the Save feature is enabled, users can save listings for easier access later.

### Q123. Can I save service providers? If the Save feature is available for services, users can save providers/listings.

### Q124. Can the owner see that I saved their listing? Only if FindAfriq's current notification system provides that information.

## 20. NOTIFICATIONS

### Q125. What notifications can I receive? Depending on your account and platform activity, notifications may include:
- Listing approved
- Listing rejected
- Listing saved
- Listing featured
- New messages
- Booking/request updates
- Account/verification updates

### Q126. Why am I not receiving notifications? Check:
- Your notification settings
- Internet connection
- Email inbox/spam folder
- Phone notification permissions If the issue continues, contact support.

## 21. ADMIN / LISTING REVIEW

### Q127. Why does my listing need approval? Approval helps FindAfriq maintain listing quality, trust, and compliance with platform requirements.

### Q128. Can I post immediately? Some users may be able to submit listings immediately, but publication may require review and approval.

### Q129. Can FindAfriq edit my listing? FindAfriq may correct or request changes to listings where necessary to maintain platform quality.

## 22. RWANDA-SPECIFIC FAQ

### Q130. Is FindAfriq available in Kigali? Yes. Kigali is the initial focus of FindAfriq's Rwanda rollout.

### Q131. Can I find property in Kigali? Yes, where listings are available.

### Q132. Which areas of Kigali does FindAfriq cover? Coverage depends on available listings. FindAfriq can expand coverage as more property owners and agents join.

### Q133. Can Rwandan agents join FindAfriq? Yes, eligible real estate agents can register and go through the applicable approval/verification process.

### Q134. Can Rwandan businesses register as service providers? Yes, eligible service providers can register.

### Q135. What currency is used in Rwanda? Rwanda listings can use Rwandan Francs (RWF) where applicable.

### Q136. What documents are required for Rwandan service providers? Requirements may include identification and valid business registration documentation, depending on the provider type.

### Q137. Will FindAfriq expand outside Kigali? The plan is to expand gradually based on market demand, supply, operational capacity, and platform performance.

## 23. LIBERIA-SPECIFIC FAQ

### Q138. Is FindAfriq available in Liberia? Yes.

### Q139. Can Liberian landlords list properties? Yes, eligible property owners can list properties.

### Q140. Can Liberian agents join? Yes, eligible agents can register.

### Q141. Can Liberian service providers join? Yes.

### Q142. What services are available in Liberia? Service availability depends on the providers currently registered on the platform.

## 24. PLATFORM RULES

### Q143. What are FindAfriq's posting rules? Users must provide accurate information, use authorized images, avoid misleading content, and follow FindAfriq's listing requirements.

### Q144. Can I post fake listings? No.

### Q145. Can I post misleading prices? No. Listing information should be accurate and transparent.

### Q146. Can I post duplicate listings? Avoid unnecessary duplicate listings. FindAfriq may remove duplicates.

### Q147. Can I post offensive content? No. Content must comply with FindAfriq's community and platform rules.

### Q148. Can I post illegal products or services? No. Illegal or prohibited products/services are not allowed.`;

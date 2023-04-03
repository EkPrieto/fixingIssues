/// <reference types="cypress" />
import { getConstants } from '../../fixtures/getConstants';
//import '../../support/css.js'
//const faker = require('faker')
import { faker } from '@faker-js/faker';
faker.locale = 'en';

const moment = require('moment');
let userData = {
  randomNumber: faker.datatype.number()
  //randomNumber: faker.datatype.number({ min: 1, max: 9999 })
};

describe('venueAdminCreateEvent', () => {
  beforeEach('Login', function() {
    // Login as venue admin
    cy.venueAdminLogin(getConstants({ timeout: 10000 }));
  });
  afterEach(() => {
    cy.logout();
    //    cy.clearCookies()
    cy.reload({ force: true });
  });
  // **** THIS SECTION SETS THE DATES FROM CURRENT TO +x IN THE FUTURE ************
  var myCurrentDate = moment().format('MM/DD/YY');
  var myEndDate = moment()
    .add(5, 'd') // <<<< -------------- CHANGE THIS NUMBER -------------------- >>>>
    .format('MM/DD/YY');
  var myCurrentTime = moment().format('hh:mm:ss a');
  // *************************** END OF DATE SET  *********************************

  //Login
  it('1-Logs in as venue admin, creates new event but cancels', () => {
    // ***************************************************
    // SCRIPT CREATES EVENT THAT REQUIRES AN ACCESS CODE
    // FOR RENTER TO DELAY PAYMENT TO GROUP W/O A CC
    // ***************************************************
    //cy.venueadmin()
    cy.wait(4000);
    cy.contains('EVENTS').click();
    //cy.wait(500) //wait 1/2 second
    cy.contains('CREATE EVENT').click();
    cy.wait(5500);

    //CSS CHECKS
    cy.h2Header().contains('Basic Information');
    //

    //BASIC INFORMATION
    const dateTime = `${myCurrentDate}-${myCurrentTime}`;

    cy.get('[name="eventName"]')
      .type(`Automation Venue Test Event for REGRESSION ${dateTime}`);
    
    cy.get('[name="eventDescription"]')
      .type(`This was created from an automation script on ${dateTime} Central time`);
    
    // ******* SET THE TIMES ******************
    // CHECK IN
cy.get('[name="checkInTime"]')
.focus()
.type('00:45')
.wait(500);

// CHECK OUT
cy.get('[name="checkOutTime"]')
.focus()
.type('13:15')
.wait(500);


    // Renter Delayed Payment section
    // SECURE = Require Group Code
    // UNSECURE = Require a renter CC
    // Click on the switch
cy.get('[class*="MuiSwitch-input"]').click({ force: true });

// Check the description of the delayed payment
cy.contains('Choose the type of delayed payment you would like to offer.').should('exist');

// Click on the unsecured option
cy.get('[value="unsecured"]').click({ force: true });

// Verify the label for unsecured option
cy.contains('Allow delayed payment with a credit/debit card on file').should('exist');

// Click on the secured option
cy.get('[value="secured"]').click({ force: true });

// Verify the label for secured option
cy.contains('Allow delayed payment with an access code').should('exist');

// Check the deferred selection notice
cy.get('[class="deferred-selection-notice"]').should('exist');

// Define regex to check the text in the notice
const regex = /Delayed payment is only available for orders with a subtotal of \$\d+ or more\./;

// Verify that the notice contains the expected text using regex
// Verify that the deferred selection notice contains the expected text using regex
cy.get('[class="deferred-selection-notice"]').should('contain.text', ': By selecting this option, you understand that you are accepting liability and responsibility for paying platform fees that occur from payments not collected at the end of the event.');

// Set the dates and times
cy.get('[placeholder="END DATE"]').clear().type(myEndDate);
cy.get('[placeholder="OPEN DATE"]').clear().type(myCurrentDate);
cy.get('[placeholder="CLOSE DATE"]').clear().type(myEndDate);
cy.get('[name="openTime"]').clear().type('12:45 AM');
cy.get('[name="closeTime"]').clear().type('12:45 PM');

// Get a hold of the Venue agreement drop-down and click to open
// Select the venue agreement from the dropdown list
cy.get('[id="mui-component-select-venueAgreement"]').click();
cy.get('[id="menu-venueAgreement"]')
  .should('exist')
  .get('li')
  .should('exist')
  .first()
  .click();

// Verify that the selected venue agreement exists
cy.get('[class="MuiTypography-root MuiListItemText-primary MuiTypography-body1"]')
  .should('exist');

// Open the venue map dropdown list
cy.get('[id="mui-component-select-venueMap"]').click();

    // The list of agreements should appear
 // Select the venue agreement from the dropdown list
cy.get('[id="mui-component-select-venueAgreement"]').click();
cy.get('[id="menu-venueAgreement"]')
  .should('exist')
  .get('li')
  .should('exist')
  .first()
  .click();

// Verify that the selected venue agreement exists
cy.get('[class="MuiTypography-root MuiListItemText-primary MuiTypography-body1"]')
  .should('exist');

// Open the venue map dropdown list
cy.get('[id="mui-component-select-venueMap"]').click();

    // ************************
    // Create some addOns
    // Esperar hasta que se muestre el botón "Mostrar filtros" y hacer clic
cy.contains('SHOW FILTERS', { timeout: 10000 }).click();

// Ingresar el nombre del evento y aplicar los filtros
cy.get('[id="NAME"]').type('Automation Venue Test Event for REGRESSION ').type(myCurrentDate);
cy.get('[data-testid="filters-apply-btn"]').click();

// Esperar un segundo
cy.wait(1000);

// Verificar que el mensaje de "deferred-selection-notice" contenga el texto esperado
cy.get('[class="deferred-selection-notice"]')
  .invoke('text')
  .should('match', /By selecting this option, you understand that you are accepting liability and responsibility for paying platform fees that occur from payments not collected at the end of the event./);

// Establecer las fechas
cy.get('[placeholder="START DATE"]').clear().type(myCurrentDate);
cy.get('[placeholder="END DATE"]').clear().type(myEndDate);
cy.get('[placeholder="OPEN DATE"]').clear().type(myCurrentDate);
cy.get('[placeholder="CLOSE DATE"]').clear().type(myEndDate);

// Establecer los horarios
cy.get('[name="openTime"]').clear().type('00:45 AM');
cy.get('[name="closeTime"]').clear().type('12:45 PM');

// Seleccionar el acuerdo de la ubicación
cy.get('[id="mui-component-select-venueAgreement"]').click();
cy.get('[id="menu-venueAgreement"]').find('li').should('exist').first().click();

// Seleccionar el mapa de la ubicación
cy.get('[id="mui-component-select-venueMap"]').click();
cy.get('[id="menu-venueMap"]').find('li').should('exist').first().click();

// Agregar un complemento
cy.contains('+ ADD ON').click();
cy.get('[class="card-row addOn"]').within(() => {
  cy.get('[class*="card-select"]').click();
  cy.get('.MuiPopover-paper > ul > li').should('exist').first().click();
  cy.get('[name="addOns[0].price"]').type('2.50');
});

// Eliminar el complemento
cy.get('[class="remove-addOn"]').click();
cy.get('[name="addOns[0].price"]').should('not.exist');

// Volver a agregar el complemento
cy.contains('+ ADD ON').click();
cy.get('[class="card-row addOn"]').within(() => {
  cy.get('[class*="card-select"]').click();
}); 

    // Select the second add on in the list
    // Seleccionar el segundo elemento de la lista de MuiPopover-paper y hacer clic en él
cy.get('.MuiPopover-paper > ul > li')
.eq(1)
.click();

// Escribir '3.50' en el campo de entrada correspondiente al primer complemento
const qtyInputRedo = cy.get('[name="addOns[0].price"]');
qtyInputRedo.should('exist').type('3.50');

// Añadir un nuevo complemento
const addAddOnButton1 = cy.contains('+ ADD ON');
addAddOnButton1.should('exist').click();

// Seleccionar el nuevo complemento en la lista desplegable correspondiente
const addOnCard1 = cy.get('[class="card-row addOn"]');
const addOnSelect1 = addOnCard1.find('[id="mui-component-select-addOns[1].id"]');
addOnSelect1.click();

    // Seleccionar el primer complemento en la lista
cy.get('.MuiPopover-paper > ul > li')
.eq(0)
.click();

// Agregar una cantidad para el segundo complemento
const qtyInput2 = cy.get('[name="addOns[1].price"]');
qtyInput2.should('exist').type('5.50');

// Añadir un nuevo complemento
const addAddOnButton2 = cy.contains('+ ADD ON');
addAddOnButton2.should('exist').click();

// Seleccionar el nuevo complemento en la lista desplegable correspondiente
const addOnCard2 = cy.get('[class="card-row addOn"]');
const addOnSelect2 = addOnCard2.find('[id="mui-component-select-addOns[2].id"]');
addOnSelect2.click();

    // Seleccionar el primer complemento en la lista
cy.get('.MuiPopover-paper > ul > li')
.eq(0)
.click();

// Agregar una cantidad para el tercer complemento
const qtyInput3 = cy.get('[name="addOns[2].price"]');
qtyInput3.should('exist').type('7.50');

// Hacer clic en el botón 'NEXT: ADD STALLS'
cy.contains('NEXT: ADD STALLS').click();

    // ****************************************
    //                STALLS
    // ****************************************
   // Activar el interruptor de Stalls
cy.get('[class="MuiSwitch-root"]').click();

// Activar las preguntas personalizadas para Stalls
cy.get('div[class="question-bloc"]').within(() => {
  cy.get('[data-testid="custom-questions-checkbox"]').click();
});
cy.wait(500);

// Agregar la primera pregunta - Selección única (Marcada como obligatoria)
cy.get('[data-testid="question-name"]')
  .type('1-This is a Single-Select question');
cy.get('[value="Option 1"]')
  .clear({ force: true })
  .type('You can select this one');
cy.get('[class="option-radio"]').click();
cy.get('[value="Option 2"]')
  .clear({ force: true })
  .type('Or this one')
  .wait(500);
cy.get('div[class="footer"]').within(() => {
  cy.get('[data-testid="custom-question-required"]').click();
  cy.get('[data-testid="add-question-button"]').click({ force: true });
});

// Select and type in the second multi-select question
cy.get('[data-testid="question-name"]').eq(1).type('2-This is a Multi-Select question');

// Modify the first option of the multi-select question
cy.get('[value="Option 1"]').eq(1).clear().type('You can select this one', { force: true });

// Select the first option of the multi-select question
cy.get('[class="option-radio"]').eq(1).click();

// Modify the second option of the multi-select question
cy.get('[value="Option 2"]').eq(1).clear().type('And/Or this one');

// Change the question type to multi-select
cy.get('[id="mui-component-select-stallQuestions[1].questionType"]').click({ force: true });
cy.get('[data-value="multipleSelection"]').click({ force: true }).wait(500);

// Set the second question as required
cy.get('div[class="footer"]').eq(1).within(() => {
cy.get('[data-testid="custom-question-required"]').click();
});

// Add another question
cy.get('[data-testid="add-question-button"]').click({ force: true });


    // Select and type in the third free-text question
cy.get('[data-testid="question-name"]').eq(2).type('3-This is an Open Text question that does not require an answer');

// Change the question type to free text
cy.get('[id="mui-component-select-stallQuestions[2].questionType"]').click({ force: true });
cy.get('[data-value="openText"]').click({ force: true });

// Reorder the questions by dragging and dropping the first question
cy.get('[data-testid="question-name"]').eq(1).trigger('dragstart');
cy.get('[data-testid="question-name"]').eq(0).trigger('drop');

// Type in the name of a stall and select it
cy.get('[name="stalls[0].name"]').type('Barn 1');
cy.get('[class="MuiButtonBase-root MuiButton-root MuiButton-text active-button"]').click();
cy.contains('DESELECT ALL').click();
cy.contains('TEST BARN 1').click();

// Expand the stall to deselect spots
cy.get('[class="MuiButtonBase-root MuiIconButton-root MuiAccordionSummary-expandIcon MuiIconButton-edgeEnd"]')
.eq(1)
.click(); // Expands Barn 1

    // Deselect some stalls from the listing
cy.get('[class="stall-listing selected"]').eq(0).click();
cy.get('[class="stall-listing selected"]').eq(2).click();

// Set stall pricing options
cy.get('[name="stalls[0].entireEvent"]').click();
cy.get('[value="flat"]').click();
cy.get('[name="stalls[0].price"]').type('10.50');

// Add a new barn
cy.get('[data-testid="add-rate-button"]').click({ force: true });
cy.get('[class="card-row"]').eq(1).within(() => {
cy.get('[name="stalls[1].name"]').type('Barn 2');
cy.get('[class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"]')
.contains('TEST BARN 2 (0/50)')
.click();
cy.get('[class="MuiIconButton-label"]')
.eq(10)
.click(); // Expand BARN 2
});

        //Agregar fechas
cy.get('[class="DateInput DateInput_1"]').first().find('[id="startDate"]')
.should('exist')
.focus().type(myCurrentDate, { force: true });

cy.get('[class="DateInput DateInput_1"]').last().find('[id="endDate"]')
.should('exist')
.focus().type(myEndDate, { force: true });

//Agregar precio de tarifa
cy.get('[name="stalls[0].entireEvent"]').click();
cy.get('[value="flat"]').click();
cy.get('[name="stalls[0].price"]').type('10.50');

//Añadir otro establo
cy.get('[data-testid="add-rate-button"]').click({ force: true });
cy.get('[class="card-row"]').eq(1).within(() => {
  cy.get('[name="stalls[1].name"]').type('Barn 2');
  cy.get('[class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"]')
    .contains('TEST BARN 2 (0/50)')
    .click();

  cy.get('[class="MuiIconButton-label"]')
    .eq(10)
    .click();
  });

//Agregar precio de tarifa para el segundo establo
cy.get('[value="nightly"]').last().click();
cy.get('[name="stalls[1].price"]').type('50.50');

//Continuar al siguiente paso
cy.contains('NEXT: ADD RV SPOTS').click();

    // ****************************************
    //                RV
    // ****************************************
    //Enable RV Toggle
    //Toggle RV option on
const rvToggle = cy.get('[class="MuiSwitch-root"]');
rvToggle.click();

//Add custom questions for RVs
cy.get('div[class="question-bloc"]').within(() => {
cy.get('[data-testid="custom-questions-checkbox"]').click(); //Toggle custom questions on
});
cy.wait(500);

//Adding first question - Single Selection (Flagged as Required)
cy.get('[data-testid="question-name"]')
.first()
.type('1-This is a Single-Select question');
cy.get('[value="Option 1"]')
.clear({ force: true })
.type('You can select this one');
cy.get('[class="option-radio"]').click();
cy.get('[value="Option 2"]')
.clear({ force: true })
.type('Or this one')
.wait(500);
cy.get('div[class="footer"]').within(() => {
cy.get('[data-testid="custom-question-required"]').click(); //Toggle question as required
cy.get('[data-testid="add-question-button"]').click({ force: true }); //Add another question
});
    // Adding Second Question - Multi-select (Flagged as Required)
    cy.get('[data-testid="question-name"]')
      .eq(1)
      .type('2-This is a Multi-Select question');

    cy.get('[value="Option 1"]')
      .eq(1)
      .clear({ force: true })
      .type('You can select this one', { force: true });

    cy.get('[class="option-radio"]')
      .eq(1)
      .click();

    cy.get('[value="Option 2"]')
      .eq(1)
      .clear({ force: true })
      .type('And/Or this one');

    cy.get('[id="mui-component-select-rvQuestions[1].questionType"]')
      .click({ force: true });

    cy.get('[data-value="multipleSelection"]')
      .click({ force: true })
      .wait(500);

    cy.get('div[class="footer"]')
      .eq(1)
      .within(() => {
        cy.get('[data-testid="custom-question-required"]')
          .click()
          .wait(500);

        cy.get('[data-testid="add-question-button"]')
          .click({ force: true });
      });

   //Agregar tercera pregunta de texto abierto sin requerir respuesta
cy.get('[data-testid="question-name"]').eq(2).type('3-This is an Open Text question that does not require an answer');

//Seleccionar tipo de pregunta "texto abierto"
cy.get('[id="mui-component-select-rvQuestions[2].questionType"]').click({force: true});
cy.get('[data-value="openText"]').click({force: true});

//Arrastrar y soltar la primera pregunta para que sea la segunda y verificar que se hizo correctamente
cy.get('[data-testid="question-name"]').eq(0).trigger('dragstart');
cy.get('[data-testid="question-name"]').eq(1).trigger('drop');

//Agregar lote
cy.get('[id="mui-component-select-rvs[0].rvLotId"]').click();
cy.wait(1000);
cy.get('[class="MuiButtonBase-root MuiListItem-root MuiMenuItem-root MuiMenuItem-gutters MuiListItem-gutters MuiListItem-button"]').contains('Test_Green RV Lot').click();
cy.get('[class="action"]').click(); //seleccionar todo
cy.get('[name="rvs[0].entireEvent"]').click();

//Seleccionar los primeros y últimos elementos de una lista
cy.get('[class*="MuiPaper-elevation1 MuiPaper-rounded"]').eq(4).within(() => {
cy.get('[class="rv-item"]').eq(0).click().click().click();
cy.get('[class="rv-item"]').eq(10).click();
});

//Elegir precio "plano"
cy.get('[name="pricing"]').eq(0).click();
cy.get('[name="rvs[0].price"]').type('5.50');

    // Agregar otro lote de RV
cy.get('[data-testid="add-rate-button"]').click({ force: true });

cy.get('[id="mui-component-select-rvs[1].rvLotId"]').click();
cy.contains('Test_Yellow RV Lot').click();
cy.get('[class="action "]').last().click();

cy.get('[class*="MuiPaper-elevation1 MuiPaper-rounded"]').eq(5).within(() => {
  cy.get('[class="rv-item"]').eq(0).click({ force: true }).click({ force: true }).click({ force: true }).eq(10).click({ force: true });
});

// Agregar fechas
cy.get('[class="DateInput DateInput_1"]').first().find('[id="startDate"]').should('exist').focus().type(myCurrentDate, { force: true });
cy.get('[class="DateInput DateInput_1"]').last().find('[id="endDate"]').should('exist').focus().type(myEndDate, { force: true });

// Establecer precio por noche
cy.get('[name="pricing"]').eq(3).click(); //NIGHTLY
cy.get('[name="rvs[1].price"]').type('15.50');
cy.wait(1000);


    // *************** CANCEL ****************
    cy.contains('Cancel').click();
    //cy.get('[data-testid="admin-logout-btn"]').click({ force: true })
    // ****************************************

    cy.wait(500);
  });
  //Login
  it('2-Logs in as venue admin, creates new event, saves', () => {
    //cy.venueadmin()
    cy.wait(4000);
    cy.contains('EVENTS').click();
    //cy.wait(500) //wait 1/2 second
    cy.contains('CREATE EVENT').click();
    cy.wait(5500);

    //CSS CHECKS
    cy.h2Header().contains('Basic Information');
    //

    //BASIC INFORMATION
    cy.get('[name="eventName"]')
      // **********************************************************
      // **********************************************************
      // NAME MUST NOT CHANGE OTHERWISE SCRIPTS WON'T WORK
      // CODE IS SET UP TO SET SPECIFIC DATA-TESTID FOR
      // EVENTS WITH "Automation Venue Test Event for REGRESSION"
      // IN THEIR NAME. AND ONLY 1 CAN BE ACTIVE AT A TIME
      // **********************************************************
      // **********************************************************
      .type('Automation Venue Test Event for REGRESSION ')
      .type(myCurrentDate)
      .type('-')
      .type(myCurrentTime);
    cy.get('[name="eventDescription"]')
      .type('This was created from an automation script on ')
      .type(myCurrentDate)
      .type(' at ')
      .type(myCurrentTime)
      .type(' Central time');

    // ******* SET THE TIMES ******************
    // CHECK IN
    cy.get('[name="checkInTime"]')
      .focus()
      .type('00:45');
    // CHECK OUT
    cy.get('[name="checkOutTime')
      .focus()
      .type('13:15');
    cy.wait(500);

    // Renter Delayed Payment section
    // SECURE = Require Group Code
    // UNSECURE = Require a renter CC
    cy.get('[class*="MuiSwitch-input"]') //Using data-testid doesn't work
      .click({ force: true });
    cy.get('[class="deferred-description"]')
      .should('exist')
      .contains('Choose the type of delayed payment you would like to offer.');
    // UNSECURED is listed FIRST
    cy.get('[value="unsecured"]').click({ force: true });
    cy.get('label[class="MuiFormControlLabel-root"]')
      .eq(0)
      //.contains('Unsecured')
      .contains('Allow delayed payment with a credit/debit card on file')
      .wait(500);
    cy.get('[value="secured"]').click({ force: true });
    cy.get('label[class="MuiFormControlLabel-root"]')
      .eq(1)
      //.contains('Secured')
      .contains('Allow delayed payment with an access code');

    // Verifica que la notificación de selección diferida existe
cy.get('.deferred-selection-notice').should('exist');

// Verifica que se muestra el mensaje de responsabilidad
const liabilityMessage = 'By selecting this option, you understand that you are accepting liability and responsibility for paying platform fees that occur from payments not collected at the end of the event.';
cy.contains(liabilityMessage);

// Establece las fechas y horarios
const startDateInput = cy.get('[placeholder="START DATE"]');
startDateInput.clear({ force: true }).type(myCurrentDate, { force: true });

const endDateInput = cy.get('[placeholder="END DATE"]');
endDateInput.clear({ force: true }).type(myEndDate, { force: true });

const openDateInput = cy.get('[placeholder="OPEN DATE"]');
openDateInput.clear({ force: true }).type(myCurrentDate, { force: true });

const closeDateInput = cy.get('[placeholder="CLOSE DATE"]');
closeDateInput.clear({ force: true }).type(myEndDate, { force: true });

cy.get('[name="openTime"]')
  .clear({ force: true })
  .type('12:45 AM', { force: true });

cy.get('[name="closeTime"]')
  .clear({ force: true })
  .type('12:45 PM', { force: true });

    // Get a hold of the Venue agreement drop-down and click to open
    const venueAgreementDiv = cy.get('[id="mui-component-select-venueAgreement"]');
    venueAgreementDiv.should('exist');
    venueAgreementDiv.click();

    // The list of agreements should appear
    const venueAgreementMenuPopoverRoot = cy.get('[id="menu-venueAgreement"]');
    venueAgreementMenuPopoverRoot
      .should('exist')
      .get('.MuiPopover-paper > ul > li')
      //.eq(0)
      .should('exist');
    // Click the 1st item (index #0)
    const selectedVenueDocument = cy
      .get('.MuiPopover-paper > ul > li')
      .eq(0)
      .click();

    selectedVenueDocument.should('exist');

    //Get a hold of the Venue Map drop-down and click to open
    const venueMapDiv = cy.get('[id="mui-component-select-venueMap"]');
    venueMapDiv.should('exist');
    venueMapDiv.click();

    // The list of agreements should appear
    const venueMapMenuPopoverRoot = cy.get('[id="menu-venueMap"]');
    venueMapMenuPopoverRoot
      .should('exist')
      .get('.MuiPopover-paper > ul > li')
      //.eq(0)
      .should('exist');
    // Click the 1st item (index #0)
    const selectedVenueMap = cy
      .get('.MuiPopover-paper > ul > li')
      .eq(0)
      .click();

    selectedVenueMap.should('exist');

    // ************************
    // Create some addOns
    const addAddOnButton = cy.contains('+ ADD ON');
    addAddOnButton.should('exist');
    addAddOnButton.click();

    cy.wait(500);
    const addOnCard = cy.get('[class="card-row addOn"]');
    const addOnSelect = addOnCard.find('[class*="card-select"]');
    addOnSelect.click();

    // Select the first add on in the list
    cy.get('.MuiPopover-paper > ul > li')
      .eq(0)
      .click();

    // Add a quantity
    const qtyInput = cy.get('[name="addOns[0].price"]');
    qtyInput.should('exist');
    qtyInput.type('2.50');

    // Remove the add on
    const deleteBtn = cy.get('[class="remove-addOn"]');
    deleteBtn.click();
    qtyInput.should('not.exist');

    // Re-enter the addOn info
    cy.contains('+ ADD ON')
      .should('exist')
      .click();

    cy.get('[class="card-row addOn"]')
      .find('[class*="card-select"]')
      .click();
    // Select the second add on in the list
    cy.get('.MuiPopover-paper > ul > li')
      .eq(1)
      .click();

    const qtyInputRedo = cy.get('[name="addOns[0].price"]');
    qtyInputRedo.should('exist');
    qtyInputRedo.type('3.50');
    //ADD ON: MATS
    const addAddOnButton1 = cy.contains('+ ADD ON');
    addAddOnButton1.should('exist');
    addAddOnButton1.click();

    const addOnCard1 = cy.get('[class="card-row addOn"]');
    const addOnSelect1 = addOnCard1.find('[id="mui-component-select-addOns[1].id"]');
    addOnSelect1.click();
    // Select the first add on in the list
    cy.get('.MuiPopover-paper > ul > li') //MATS
      .eq(0)
      .click();

    // Add a quantity
    const qtyInput1 = cy.get('[name="addOns[1].price"]');
    qtyInput1.should('exist');
    qtyInput1.type('5.50');

    //ADD ON: HAY
    const addAddOnButton2 = cy.contains('+ ADD ON');
    addAddOnButton2.should('exist');
    addAddOnButton2.click();

    const addOnCard2 = cy.get('[class="card-row addOn"]');
    const addOnSelect2 = addOnCard1.find('[id="mui-component-select-addOns[2].id"]');
    addOnSelect2.click();
    // Select the first add on in the list
    cy.get('.MuiPopover-paper > ul > li') //MATS
      .eq(0)
      .click();

    // Add a quantity
    const qtyInput2 = cy.get('[name="addOns[2].price"]');
    qtyInput2.should('exist');
    qtyInput2.type('7.50');

    cy.contains('NEXT: ADD STALLS').click();
    // ****************************************
    //                STALLS
    // ****************************************
    //Enable Stalls Toggle
    const stallsToggle = cy.get('[class="MuiSwitch-root"]');
    stallsToggle.click();

    // CUSTOM QUESTIONS: FOR STALLS
    cy.get('div[class="question-bloc"]').within(() => {
      cy.get('[data-testid="custom-questions-checkbox"]').click(); //Toggles questions on
    });
    cy.wait(500);

    // Adding First Question - Single Selection (Flagged as Required)
    cy.get('[data-testid="question-name"]') //Doesn't need an .eq(0) becausee only this one is visible at first
      .type('1-This is a Single-Select question');
    cy.get('[value="Option 1"]')
      .clear({ force: true })
      .type('You can select this one');
    cy.get('[class="option-radio"]').click();
    cy.get('[value="Option 2"]')
      .clear({ force: true })
      .type('Or this one')
      .wait(500);
    cy.get('div[class="footer"]').within(() => {
      cy.get('[data-testid="custom-question-required"]').click(); //Required? toggle
      cy.get('[data-testid="add-question-button"]').click({ force: true }); //Adds additional question
    });

    //Adding Second Question - Multi-select (Flagged as Required)
    cy.get('[data-testid="question-name"]')
      .eq(1)
      .type('2-This is a Multi-Select question');
    cy.get('[value="Option 1"]')
      .eq(1)
      .clear({ force: true })
      .type('You can select this one', { force: true });
    cy.get('[class="option-radio"]')
      .eq(1)
      .click();
    cy.get('[value="Option 2"]')
      .eq(1)
      .clear({ force: true })
      .type('And/Or this one');
    cy.get('[id="mui-component-select-stallQuestions[1].questionType"]').click({
      force: true
    });
    cy.get('[data-value="multipleSelection"]')
      .click({ force: true })
      .wait(500);
    cy.get('div[class="footer"]')
      .eq(1)
      .within(() => {
        cy.get('[data-testid="custom-question-required"]').click(); //Required? toggle
        cy.get('[data-testid="add-question-button"]').click({ force: true }); //Adds additional question
      });

    //Adding Third Question - Free text (Flagged as Optional)
    cy.get('[data-testid="question-name"]')
      .eq(2)
      .type('3-This is an Open Text question that does not require an answer');
    cy.get('[id="mui-component-select-stallQuestions[2].questionType"]').click({
      force: true
    });
    cy.get('[data-value="openText"]').click({ force: true });

    // Drag and Drop question 1 to be 2nd question & verify success
    cy.get('[data-testid="question-name"]')
      .eq(1)
      .trigger('dragstart')
      .get('[data-testid="question-name"]')
      .eq(0)
      .trigger('drop');

    cy.get('[name="stalls[0].name"]').type('Barn 1');
    cy.get('[class="MuiButtonBase-root MuiButton-root MuiButton-text active-button"]').click();
    cy.contains('DESELECT ALL').click();
    cy.contains('TEST BARN 1').click();
    //Expand to de-select spots
    cy.get('[class="MuiButtonBase-root MuiIconButton-root MuiAccordionSummary-expandIcon MuiIconButton-edgeEnd"]')
      .eq(1) //EXPANDS BARN 1
      .click();

    //Remove stalls from the listing
    cy.get('[class="stall-listing selected"]')
      .eq(0)
      .click();
    cy.get('[class="stall-listing selected"]')
      .eq(2)
      .click();
    cy.get('[name="stalls[0].entireEvent"]').click(); //Entire Event
    cy.get('[value="flat"]').click(); //Flat Rate
    cy.get('[name="stalls[0].price"]').type('10.50'); //Flat Rate $ Amount

    //ADD ANOTHER BARN
    cy.get('[data-testid="add-rate-button"]').click({ force: true });
    cy.get('[class="card-row"]')
      .eq(1)
      .within(() => {
        cy.get('[name="stalls[1].name"]').type('Barn 2');
        cy.get('[class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"]')
          .contains('TEST BARN 2 (0/50)')
          .click();

        cy.get('[class="MuiIconButton-label"]')
          .eq(10) //was 8
          //.eq(8)
          .click(); //Expand BARN 2

        //Remove stalls from the listing
        cy.get('[class="stall-listing selected"]')
          .eq(0)
          .click();
        cy.get('[class="stall-listing selected"]')
          .eq(2)
          .click();

        //Add Dates
        cy.get('[class="DateInput DateInput_1"]')
          .first()
          .find('[id="startDate"]')
          .should('exist')
          .focus()
          .type(myCurrentDate, { force: true });
        // End date
        cy.get('[class="DateInput DateInput_1"]')
          .last()
          .find('[id="endDate"]')
          .should('exist')
          .focus()
          .type(myEndDate, { force: true });

        //cy.get('[name="stalls[1].entireEvent"]').click()
        cy.get('[value="nightly"]')
          .last()
          .click();
        cy.get('[name="stalls[1].price"]').type('50.50'); //Nightly Rate $ Amount
      });
    cy.contains('NEXT: ADD RV SPOTS').click();
    // ****************************************
    //                RV
    // ****************************************
    //Enable RV Toggle
    const rvToggle = cy.get('[class="MuiSwitch-root"]');
    rvToggle.click();

    // CUSTOM QUESTIONS: FOR RVs
    cy.get('div[class="question-bloc"]').within(() => {
      cy.get('[data-testid="custom-questions-checkbox"]').click(); //Toggles questions on
    });
    cy.wait(500);

    // Adding First Question - Single Selection (Flagged as Required)
    cy.get('[data-testid="question-name"]') //Doesn't need an .eq(0) becausee only this one is visible at first
      .type('1-This is a Single-Select question');
    cy.get('[value="Option 1"]')
      .clear({ force: true })
      .type('You can select this one');
    cy.get('[class="option-radio"]').click();
    cy.get('[value="Option 2"]')
      .clear({ force: true })
      .type('Or this one')
      .wait(500);
    cy.get('div[class="footer"]').within(() => {
      cy.get('[data-testid="custom-question-required"]').click(); //Required? toggle
      cy.get('[data-testid="add-question-button"]').click({ force: true }); //Adds additional question
    });

    //Adding Second Question - Multi-select (Flagged as Required)
    cy.get('[data-testid="question-name"]')
      .eq(1)
      .type('2-This is a Multi-Select question');
    cy.get('[value="Option 1"]')
      .eq(1)
      .clear({ force: true })
      .type('You can select this one', { force: true });
    cy.get('[class="option-radio"]')
      .eq(1)
      .click();
    cy.get('[value="Option 2"]')
      .eq(1)
      .clear({ force: true })
      .type('And/Or this one');
    cy.get('[id="mui-component-select-rvQuestions[1].questionType"]').click({
      force: true
    });
    cy.get('[data-value="multipleSelection"]')
      .click({ force: true })
      .wait(500);
    cy.get('div[class="footer"]')
      .eq(1)
      .within(() => {
        cy.get('[data-testid="custom-question-required"]').click(); //Required? toggle
        cy.get('[data-testid="add-question-button"]').click({ force: true }); //Adds additional question
      });

    //Adding Third Question - Free text (Flagged as Optional)
    cy.get('[data-testid="question-name"]')
      .eq(2)
      .type('3-This is an Open Text question that does not require an answer');
    cy.get('[id="mui-component-select-rvQuestions[2].questionType"]').click({
      force: true
    });
    cy.get('[data-value="openText"]').click({ force: true });

    // Drag and Drop question 1 to be 2nd question & verify success
    cy.get('[data-testid="question-name"]')
      .eq(1)
      .trigger('dragstart')
      .get('[data-testid="question-name"]')
      .eq(0)
      .trigger('drop');

    //Add Lot
    cy.get('[id="mui-component-select-rvs[0].rvLotId"]').click();
    cy.wait(1000);
    cy.get('[class="MuiButtonBase-root MuiListItem-root MuiMenuItem-root MuiMenuItem-gutters MuiListItem-gutters MuiListItem-button"]')
      .contains('Test_Green RV Lot')
      .click();
    cy.get('[class="action "]').click(); //SELECT ALL
    cy.get('[name="rvs[0].entireEvent"]').click();

    cy.get('[class*="MuiPaper-elevation1 MuiPaper-rounded"]')
      .eq(4)
      .within(() => {
        cy.get('[class="rv-item  "]')
          .eq(0)
          .click();
        cy.get('[class="rv-item  "]')
          .eq(0)
          .click();
        cy.get('[class="rv-item  "]')
          .eq(0)
          .click();
        cy.get('[class="rv-item  "]')
          .eq(10)
          .click();
      });

    cy.get('[name="pricing"]')
      .eq(0)
      .click(); //FLAT
    cy.get('[name="rvs[0].price"]').type('5.50');

    //ADD ANOTHER RV LOT
    cy.get('[data-testid="add-rate-button"]').click({ force: true });

    cy.get('[id="mui-component-select-rvs[1].rvLotId"]').click();
    cy.get('[class="MuiButtonBase-root MuiListItem-root MuiMenuItem-root MuiMenuItem-gutters MuiListItem-gutters MuiListItem-button"]')
      .contains('Test_Yellow RV Lot')
      .click();
    cy.get('[class="action "]')
      .last()
      .click();

    cy.get('[class*="MuiPaper-elevation1 MuiPaper-rounded"]')
      .eq(5)
      .within(() => {
        cy.get('[class="rv-item  "]')
          .eq(0)
          .click({ force: true });
        cy.get('[class="rv-item  "]')
          .eq(0)
          .click({ force: true });
        cy.get('[class="rv-item  "]')
          .eq(0)
          .click({ force: true });
        cy.get('[class="rv-item  "]')
          .eq(10)
          .click({ force: true });
      });

    //Add Dates
    cy.get('[class="DateInput DateInput_1"]')
      .first()
      .find('[id="startDate"]')
      .should('exist')
      .focus()
      .type(myCurrentDate, { force: true });
    // End date
    cy.get('[class="DateInput DateInput_1"]')
      .last()
      .find('[id="endDate"]')
      .should('exist')
      .focus()
      .type(myEndDate, { force: true });
    cy.get('[name="pricing"]')
      .eq(3)
      .click(); //NIGHTLY
    cy.get('[name="rvs[1].price"]').type('15.50');
    cy.wait(1000);

    cy.contains('REVIEW & SAVE').click();
    // ****************************************
    //              EDIT
    // ****************************************
    cy.get('[class="MuiButton-label"]')
      .contains('Edit')
      //.eq(1)
      .click();
    cy.wait(1000); //Waits 1 second then clicks through each tab
    //cy.contains('STALLS').eq(1).click()
    cy.get('div.breadcrumbs > a:nth-child(2)').click(); //STALLS
    cy.wait(2000);
    //cy.contains('RV SPOTS').eq(1).click()
    cy.get('div.breadcrumbs > a:nth-child(3)').click(); //RV STPOTS
    cy.wait(2000);
    cy.contains('REVIEW & SAVE').click();

    // VALIDATE SUMMARY PAGE
    // BASIC DETAILS
    cy.get('[class*="MuiPaper-elevation1 MuiPaper-rounded"]')
      .eq(0)
      .within(() => {
        cy.h2Header().contains('Basic Details');
        cy.get('[class="info-row"]').contains('Event Name');
        cy.get('[class="info-row"]').contains('Automation Venue Test Event for REGRESSION');
        cy.get('[class="info-row"]').contains('Check In Time');
        cy.get('[class="info-row"]').contains('Check Out Time');
        cy.get('[class="info-row"]').contains('Venue Agreement');
        cy.get('[class="info-row"]').contains('Venue Map');
        cy.get('[class="info-row"]').contains('Reservable Dates');
        cy.get('[class="info-row"]').contains('Online Booking Window');
        cy.get('[class="info-row"]').contains('Event Description');
      });

    // STALLS
    cy.get('[class*="MuiPaper-elevation1 MuiPaper-rounded"]')
      .eq(1)
      .within(() => {
        cy.h2Header().contains('Stalls');
        cy.get('[data-testid="event-stall-flip"]').contains('Enabled');
        cy.get('[class="info-row"]').contains('Barn 1');
        cy.get('[class*="info"]').contains('Flat Rate ');
        cy.get('[class="info-row"]').contains('Barn 2');
        cy.get('[class*="info"]').contains('Nightly Rate ');
        cy.get('[class="info-questions"]') //.should('exist')
          // QUESTIONS ARE RE-ORDERED TO 2,1,3 USING DRAG/DROP
          .within(() => {
            cy.get('p[class="info-question"]')
              .eq(0)
              .contains('2-This is a Multi-Select question');
            cy.get('p[class="info-question"]')
              .eq(1)
              .contains('1-This is a Single-Select question');
            cy.get('p[class="info-question"]')
              .eq(2)
              .contains('3-This is an Open Text question that does not require an answer');
          });
      });
    // RVS
    cy.get('[class*="MuiPaper-elevation1 MuiPaper-rounded"]')
      .eq(2)
      .within(() => {
        cy.h2Header().contains('RV Spots');
        cy.get('[data-testid="event-rv-flip"]').contains('Enabled');
        cy.get('[class="info-row"]').contains('Test_Green RV Lot');
        cy.get('[class*="info"]').contains('Flat Rate ');
        cy.get('[class="info-row"]').contains('Test_Yellow RV Lot');
        cy.get('[class*="info"]').contains('Nightly Rate ');
        cy.get('[class="info-questions"]') //.should('exist')
          // QUESTIONS ARE RE-ORDERED TO 2,1,3 USING DRAG/DROP
          .within(() => {
            cy.get('p[class="info-question"]')
              .eq(0)
              .contains('2-This is a Multi-Select question');
            cy.get('p[class="info-question"]')
              .eq(1)
              .contains('1-This is a Single-Select question');
            cy.get('p[class="info-question"]')
              .eq(2)
              .contains('3-This is an Open Text question that does not require an answer');
          });
      });
    // ***************************************
    //            SAVE
    // ***************************************

    cy.get('[class="MuiButton-label"]')
      .eq(4)
      .click();
    //cy.eventCreateSuccessToast();

    // ***************************************
    //    SEARCH FOR NEWLY-CREATED EVENT
    // ***************************************
    // Wait for the filters to appear
cy.contains('SHOW FILTERS', { timeout: 10000 }).click();

// Enter the event name in the filter
cy.get('[id="NAME"]')
  .type('Automation Venue Test Event for REGRESSION ')
  .type(myCurrentDate);

// Click on the "Apply" button
cy.get('[data-testid="filters-apply-btn"]').click();

// Wait for the results to load
cy.wait(1000);

  });
  //End of file
});

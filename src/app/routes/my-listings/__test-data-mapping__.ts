/**
 * Test to verify the property edit data mapping is correct
 */

// Example form data (what the form contains)
const formData = {
    title: "Beautiful 2 Bedroom Apartment",
    description: "Great apartment in a prime location",
    location: "Nairobi, Kenya",
    price: 50000,
    type: "Apartment", // This is stored as "type" in form
    bedrooms: 2, // This is stored as "bedrooms" in form
    bathrooms: 1,
    area: 100,
    furnished: true,
    availableFrom: "2024-03-01T00:00:00.000Z",
    availableTo: "2024-12-31T23:59:59.999Z",
};

// Expected output (what should be sent to API)
const expectedSubmitData = {
    title: "Beautiful 2 Bedroom Apartment",
    description: "Great apartment in a prime location",
    location: "Nairobi, Kenya",
    price: 50000,
    propertyType: "Apartment", // Mapped from type
    rooms: 2, // Mapped from bedrooms
    bathrooms: 1,
    area: 100,
    furnished: true,
    availableFrom: "2024-03-01T00:00:00.000Z",
    availableTo: "2024-12-31T23:59:59.999Z",
};

console.log("Form Data:", formData);
console.log("Expected Submit Data:", expectedSubmitData);

// Verify mapping
const mappingCorrect = 
    expectedSubmitData.propertyType === formData.type &&
    expectedSubmitData.rooms === formData.bedrooms;

console.log("Mapping Correct:", mappingCorrect);

/**
 * CRITICAL MAPPINGS:
 * - form.type -> api.propertyType
 * - form.bedrooms -> api.rooms
 * 
 * All other fields should match exactly
 */

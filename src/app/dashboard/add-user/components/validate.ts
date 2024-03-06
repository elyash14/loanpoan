import { IFormData } from "./UserForm";

export const validateForm = (values: IFormData) => {
    const errors: any = {};
   
    if (!/^\S+@\S+$/.test(values.email)) {
       errors.email = "Invalid email";
    }
   
    if (values.firstName.length < 2) {
       errors.firstName = "First name is too short";
    }
   
    if (values.lastName.length < 2) {
       errors.lastName = "Last name is too short";
    }
   
    if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/.test(values.password)) {
       errors.password = "Password must be at least 8 characters contain number and letter";
    }
   
    // if (!values.gender) {
    //    errors.gender = "Gender is required";
    // }
   
    if (values.cartNumber && values.cartNumber.length !== 16) {
       errors.cartNumber = "Cart number must be 16 numbers";
    }
   
    if (values.accountNumber && values.accountNumber.length < 18) {
       errors.accountNumber = "Account number must be at least 18 numbers";
    }
   
    return errors;
   };
   
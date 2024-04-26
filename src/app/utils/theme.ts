import { createTheme } from "@mantine/core";

const theme = createTheme({
    fontFamily: 'Open Sans, sans-serif',
    primaryColor: 'cyan',
    components: {
        InputWrapper: {
            styles: {
                root: {
                    marginBottom: '1rem',
                },
            },
        },
        Fieldset: {
            styles: {
                legend: {
                    fontWeight: 'bold',
                }
            }
        }
    },

});

export default theme;
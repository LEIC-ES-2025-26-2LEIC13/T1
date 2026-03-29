import { Image, useColorScheme } from 'react-native'

// images
import DarkLogo from '../assets/img/dark_logo.png'
import LightLogo from '../assets/img/light_logo.png'

const ThemedLogo = ({ ...props }) => {
    const colorScheme = useColorScheme()
    
    const logo = (colorScheme === 'dark') ? DarkLogo : LightLogo

    return (
        <Image 
            source={logo}
            {...props}
        />
    )
}

export default ThemedLogo
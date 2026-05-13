import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import {useAuth} from "../hooks/useAuth";
import {Colors} from "../constants/Colors";
import ThemedIcon from './ThemedIcon';
import Divider from './Divider';
import Spacer from './Spacer';

const CustomDrawerContent = (props) =>{
    const { logout } = useAuth();

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flex: 1 }}
        >
            {/* Top content */}
            <DrawerItemList {...props} />

            {/* Bottom section */}
            <Spacer height={10} />
            <Divider/>
            <Spacer height={10} />

            <DrawerItem
                label="Logout"
                onPress={logout}
                labelStyle={{ color: Colors.warning }}
                icon = {() => <ThemedIcon name="logout" color={Colors.warning}/>}
            />
        
        </DrawerContentScrollView>
    );
}

export default CustomDrawerContent;

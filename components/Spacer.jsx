import { View } from 'react-native'

const Spacer = ({ width = "100%", height = 40 }) => {
  return (
    <View style={{width, height}}/> // the same as {width: width, height: height}, in this case (variable and prop have the same name)
  )
}

export default Spacer
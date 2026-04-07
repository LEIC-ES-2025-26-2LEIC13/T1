import { render, screen } from "@testing-library/react-native"
import ThemedButton from "../components/ThemedButton"
import { Colors } from "../constants/Colors"

describe("ThemedButton", () => {

    test("Not pressed style", () => {
        render(<ThemedButton testID="btn" testOnly_pressed={false} />)
        
        const renderedBtn = screen.getByTestId('btn')
        expect(renderedBtn.props.style).toEqual(
            expect.arrayContaining([
                expect.not.objectContaining( { opacity: 0.8 }),
                expect.objectContaining({ backgroundColor: Colors.primary, padding: 15, borderRadius: 10 })
            ])
        )
    })


    test("Pressed style", () => {
        render(<ThemedButton testID="btn" testOnly_pressed={true} />)
        
        const renderedBtn = screen.getByTestId('btn')
        expect(renderedBtn.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining( { opacity: 0.8 }),
                expect.objectContaining({ backgroundColor: Colors.primary, padding: 15, borderRadius: 10 })
            ])
        )
    })

    test("Additional style passed", () => {
        render(<ThemedButton testID="btn" testOnly_pressed={true} style={{ margin: 10 }}  />)
        
        const renderedBtn = screen.getByTestId('btn')
        expect(renderedBtn.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ opacity: 0.8 }),
                expect.objectContaining({ backgroundColor: Colors.primary, padding: 15, borderRadius: 10 }),
                expect.objectContaining({ margin: 10 })
            ])
        )
    })
})

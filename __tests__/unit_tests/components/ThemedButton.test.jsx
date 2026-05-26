import { describe, expect, test } from '@jest/globals'
import { render, screen } from "@testing-library/react-native"
import ThemedButton from "../../../components/ThemedButton"

import { Colors } from "../../../constants/Colors"

describe("ThemedButton", () => {
    test("Not pressed style", () => {
        render(<ThemedButton testID="btn" testOnly_pressed={false} />)
        const renderedBtn = screen.getByTestId('btn')
        const style = renderedBtn.props.style

        expect(style[0]).toMatchObject({ opacity: 1, transform: [{ scale: 1 }] })
        expect(style[1][0]).toMatchObject({ backgroundColor: Colors.primary, padding: 13, borderRadius: 10 })
    })

    test("Pressed style", () => {
        render(<ThemedButton testID="btn" testOnly_pressed={true} />)
        const renderedBtn = screen.getByTestId('btn')
        const style = renderedBtn.props.style

        expect(style[0]).toMatchObject({ opacity: 0.85, transform: [{ scale: 0.985 }] })
        expect(style[1][0]).toMatchObject({ backgroundColor: Colors.primary, padding: 13, borderRadius: 10 })
    })

    test("Additional style passed", () => {
        render(<ThemedButton testID="btn" style={{ margin: 10 }} />)
        const renderedBtn = screen.getByTestId('btn')

        const style = renderedBtn.props.style
        expect(style[0]).toMatchObject({ opacity: 1} )
        expect(style[1][0]).toMatchObject({ backgroundColor: Colors.primary, padding: 13, borderRadius: 10 })
        expect(style[1][2]).toMatchObject({ margin: 10 })
    })
})

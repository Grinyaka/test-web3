import 'styled-components'

interface SVGIcon extends React.FunctionComponent<React.SVGAttributes<HTMLOrSVGElement>> {}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      white: string,
      black: string,
      greenDark: string,
      greenLight: string,
      grey: string
    },
    mobileSize: string
  }
}

declare module '*.svg' {
  const { ReactComponent } = SVGIcon
  const content: ReactComponent
  export default content
}
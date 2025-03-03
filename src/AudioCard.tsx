import * as React from 'react'
import styled from 'styled-components'
import { Play, Pause, SkipBack, SkipForward } from './controls'
import { ProgressBar, Time } from './components'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { preventDefault } from './util'

export interface AudioCardProps {
  /** Optional artwork for the song or podcast episode */
  art?: string
  /** Whether or not to automatically start playback upon mount */
  autoPlay?: boolean
  /** Background color for entire card */
  background?: string
  /** Optional class name to apply to the resulting container element */
  className?: string
  /**
   * Primary color for controls
   *
   * @default '#666'
   **/
  color?: string
  /**
   * Optional url for a hyperlink to be rendered. Will only render if
   * you include both link and linkText.
   **/

  fontAwesome?: boolean
  /** Whether or not hide the progress bar */

  hideProgress?: boolean
  /**
   * Optional url for a hyperlink to be rendered. Will only render if
   * you include both link and linkText.
   **/

  largeControl?: boolean

  /**
   * Optional url for a hyperlink to be rendered. Will only render if
   * you include both link and linkText.
   **/

  link?: string
  /**
   * Optional text for a hyperlink to be rendered. Will only render if
   * you include both link and linkText.
   **/
  linkText?: string
  /**
   * Whether or not to preload the MP3 file.
   *
   * @default 'none'
   **/
  preload?: 'auto' | 'metadata' | 'none'
  /**
   * Background for entire progress bar.
   *
   * @default '#DDD'
   **/
  progressBarBackground?: string
  /**
   * Background for the part to the left of the scrubber handle
   *
   * @default '#AAA'
   **/
  progressBarCompleteBackground?: string
  /**
   * Optional number of seconds to skip back when the "skip back"
   * control is activated. If not provided, the "skip back" button
   * will not be rendered. */
  skipBackSeconds?: number
  /**
   * Optional number of seconds to skip forward when the "skip forward"
   * control is activated. If not provided, the "skip forward" button
   * will not be rendered.  */
  skipForwardSeconds?: number

  /** URL of the MP3 file to play */
  source: string
  /** Optional title of the song or podcast episode */
  title?: string
  /** Optional function when play is clicked. */
  playHook(): void
}

const canonicalWidth = 750
const canonicalHeight = 225
const aspectRatio = canonicalWidth / canonicalHeight

export function AudioCard({
  art,
  autoPlay,
  background,
  className,
  color = '#666',
  fontAwesome = false,
  hideProgress,
  largeControl = false,
  link,
  linkText,
  preload = 'none',
  progressBarBackground = '#ddd',
  progressBarCompleteBackground = '#aaa',
  skipBackSeconds,
  skipForwardSeconds,
  source,
  title,
  playHook
}: AudioCardProps) {
  const {
    playerRef,
    playing,
    time,
    duration,
    play,
    pause,
    seek,
    skipForward,
    skipBack
  } = useAudioPlayer()
  const width = 750
  const height = width / aspectRatio
  const h = (value: number) => (value * height) / canonicalHeight
  const w = (value: number) => (value * width) / canonicalWidth

  return (
    <Container
      className={className}
      background={background}
      color={color}
      style={{ height }}
    >
      <audio
        src={source}
        ref={playerRef}
        style={{ display: 'none' }}
        preload={preload}
        autoPlay={autoPlay}
      />
      {art && (
        <Art
          src={art}
          style={{ height, width: height, minHeight: height, minWidth: height }}
        />
      )}
      <Content>
        {title && (
          <Title
            style={{
              fontSize: h(24),
              width: w(canonicalWidth - (art ? canonicalHeight : 0) - 20),
              margin: `${h(12)}px ${w(10)}px ${h(12)}px ${w(10)}px`,
              minHeight: h(30)
            }}
          >
            {title}
          </Title>
        )}
        <Controls style={{ fontSize: h(16) }}>
          {skipBackSeconds === undefined ? (
            <Control as="div" />
          ) : (
            <Control onClick={preventDefault(() => skipBack(skipBackSeconds))}>
              <SkipBack seconds={skipBackSeconds} />
            </Control>
          )}
          {largeControl ? (
            <React.Fragment>
              {!playing && (
                <LargeControl
                  onClick={event => {
                    playHook()
                    play(event)
                  }}
                >
                  {fontAwesome ? (
                    <i className="fa fa-play" aria-hidden="true" />
                  ) : (
                    <Play />
                  )}
                </LargeControl>
              )}
              {playing && (
                <LargeControl onClick={pause}>
                  {fontAwesome ? (
                    <i className="fa fa-pause" aria-hidden="true" />
                  ) : (
                    <Pause />
                  )}
                </LargeControl>
              )}{' '}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {!playing && (
                <Control
                  onClick={event => {
                    playHook()
                    play(event)
                  }}
                >
                  <Play />
                </Control>
              )}
              {playing && (
                <Control onClick={pause}>
                  <Pause />
                </Control>
              )}
            </React.Fragment>
          )}
          {skipForwardSeconds === undefined ? (
            <Control as="div" />
          ) : (
            <Control
              onClick={preventDefault(() => skipForward(skipForwardSeconds))}
            >
              <SkipForward seconds={skipForwardSeconds} />
            </Control>
          )}
        </Controls>
        {link && linkText && (
          <Link href={link} style={{ fontSize: h(20) }}>
            {linkText}
          </Link>
        )}
        {hideProgress ? null : (
          <React.Fragment>
            <Times style={{ fontSize: h(16) }}>
              <Time value={time} />
              <Time value={duration} />
            </Times>

            <ProgressBar
              value={time}
              total={duration}
              color={color}
              background={progressBarBackground}
              completeBackground={progressBarCompleteBackground}
              seek={seek}
              size={h(20)}
            />
          </React.Fragment>
        )}
      </Content>
    </Container>
  )
}

interface ContainerProps {
  background?: string
  color: string
  /** Optional class name to apply to the resulting container element */
  width?: number
}
const Container = styled.div<ContainerProps>`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-flow: row nowrap;
  * {
    font-family: 'San Francisco', 'Helvetica Neue', Helvetica, sans-serif;
    line-height: 1em;
  }
  ${({ background }) => background && `background-color: ${background};`}
  color: ${({ color }) => color};
  a {
    color: ${({ color }) => color};
    text-decoration: none;
    &:active {
      color: ${({ color }) => color};
    }
  }
`

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  padding: 0;
`

const Controls = styled.div`
  flex: 1;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`

const Times = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin: 0 5px 5px 5px;
`

const Control = styled.a.attrs({ href: '#' })`
  text-decoration: none;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  margin: 5px;
  width: 15%;
`
const LargeControl = styled.a.attrs({ href: '#' })`
  text-decoration: none;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;

  width: 90%;
`

const Art = styled.img``

const Title = styled.div`
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const Link = styled.a.attrs({ target: '_blank' })`
  display: block;
  text-align: center;
  &:hover {
    text-decoration: underline;
  }
`

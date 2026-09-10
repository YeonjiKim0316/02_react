import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Clock from './Clock.jsx'

describe('Clock', () => {
  const initialTime = new Date('2026-09-10T10:00:00')
  let consoleLogSpy

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(initialTime)

    // Clock 내부의 console.log(id)로 테스트 출력이 지저분해지는 것을 방지
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    vi.useRealTimers()
  })

  it('현재 시간을 표시한다', () => {
    // Given: 시스템 시간이 특정 시간으로 설정되어 있다
    const expectedTime = initialTime.toLocaleTimeString('ko-KR')

    // When: Clock 컴포넌트를 렌더링한다
    render(<Clock />)

    // Then: 설정한 현재 시간이 화면에 표시된다
    expect(screen.getByText(expectedTime)).toBeInTheDocument()
  })

  it('1초가 지나면 표시 시간이 갱신된다', () => {
    // Given: Clock이 특정 시간에 렌더링되어 있다
    const firstTime = initialTime.toLocaleTimeString('ko-KR')
    render(<Clock />)

    expect(screen.getByText(firstTime)).toBeInTheDocument()

    // When: 가상 시간을 1초 진행한다
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Then: 표시 시간이 1초 뒤 시간으로 변경된다
    const nextTime = new Date(initialTime.getTime() + 1000)
      .toLocaleTimeString('ko-KR')

    expect(screen.getByText(nextTime)).toBeInTheDocument()
    expect(screen.queryByText(firstTime)).not.toBeInTheDocument()
  })

  it('언마운트되면 interval을 정리한다', () => {
    // Given: interval 정리 함수를 감시하고 Clock을 렌더링한다
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = render(<Clock />)

    // When: Clock을 언마운트한다
    unmount()

    // Then: 등록된 interval이 정리된다
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)

    clearIntervalSpy.mockRestore()
  })
})
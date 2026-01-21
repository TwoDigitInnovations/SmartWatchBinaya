//
//  RCTEventEmitter+Shared.swift
//  smartwatchios
//
//  Created by Chetan on 04/12/25.
//

import Foundation
import React

private weak var globalEmitter: RCTEventEmitter?

extension RCTEventEmitter {

    /// Shared global emitter instance
    static var shared: RCTEventEmitter? {
        get { globalEmitter }
        set { globalEmitter = newValue }
    }
}


